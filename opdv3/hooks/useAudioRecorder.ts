
import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const segmentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isRecordingActiveRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const segmentInProgressRef = useRef(false);

    const startRecording = useCallback(async (
        options: {
            onSegment?: (blob: Blob) => void;
            segmentDuration?: number;
            vadThreshold?: number;
            minSegmentDuration?: number;
            stream?: MediaStream;
        } = {}
    ) => {
        setError(null);
        if (mediaRecorderRef.current || isRecordingActiveRef.current) return;
        const {
            onSegment,
            segmentDuration = 30000,
            vadThreshold = 0.015,
            minSegmentDuration = 3000,
            stream: providedStream
        } = options;

        try {
            const stream = providedStream ?? await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            const ownsStream = !providedStream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);

            let lastSpeechTime = Date.now();
            let isSpeaking = false;
            let segmentStartTime = Date.now();

            const mediaOptions = { mimeType: 'audio/webm;codecs=opus' };
            const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(mediaOptions.mimeType) ? mediaOptions : undefined);
            (recorder as any).__ownsStream = ownsStream;
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onerror = () => {
                setError('Recording error.');
                isRecordingActiveRef.current = false;
            };

            const handleTrackEnded = () => {
                isRecordingActiveRef.current = false;
                setError('Microphone track ended.');
            };
            (recorder as any).__trackEndedHandler = handleTrackEnded;
            stream.getTracks().forEach((track) => {
                track.addEventListener('ended', handleTrackEnded);
            });

            const checkVAD = () => {
                if (!isRecordingActiveRef.current) return;

                if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume();
                }

                if (recorder.state === 'recording') {
                    analyser.getFloatTimeDomainData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i] * dataArray[i];
                    }
                    const rms = Math.sqrt(sum / bufferLength);

                    const now = Date.now();
                    if (rms > vadThreshold) {
                        if (!isSpeaking) isSpeaking = true;
                        lastSpeechTime = now;
                    } else {
                        if (isSpeaking && (now - lastSpeechTime > 1500)) {
                            isSpeaking = false;
                            const duration = now - segmentStartTime;
                            if (duration > minSegmentDuration) {
                                triggerSegment();
                            }
                        }
                    }

                    if (now - segmentStartTime > segmentDuration) {
                        triggerSegment();
                    }
                }

                if (isRecordingActiveRef.current) {
                    requestAnimationFrame(checkVAD);
                }
            };

            const triggerSegment = () => {
                if (segmentInProgressRef.current) return;
                if (recorder.state !== 'recording' || audioChunksRef.current.length === 0) return;

                segmentInProgressRef.current = true;
                recorder.requestData();
                setTimeout(() => {
                    if (audioChunksRef.current.length > 0) {
                        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
                        if (onSegment) onSegment(blob);
                        audioChunksRef.current = [];
                    }
                    segmentStartTime = Date.now();
                    segmentInProgressRef.current = false;
                }, 150);
            };

            recorder.start(1000);
            isRecordingActiveRef.current = true;
            setIsRecording(true);
            setIsPaused(false);

            requestAnimationFrame(checkVAD);

        } catch (err) {
            console.error('Microphone access error:', err);
            setError('Microphone access denied.');
            setIsRecording(false);
            isRecordingActiveRef.current = false;
        }
    }, []);

    const stopRecording = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve(null);
                return;
            }

            const recorder = mediaRecorderRef.current;
            isRecordingActiveRef.current = false;

            const cleanupAndResolve = () => {
                const mimeType = recorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                const trackEndedHandler = (recorder as any).__trackEndedHandler;
                const ownsStream = (recorder as any).__ownsStream === true;
                if (recorder.stream) {
                    recorder.stream.getTracks().forEach((track) => {
                        if (trackEndedHandler) track.removeEventListener('ended', trackEndedHandler);
                        if (ownsStream) track.stop();
                    });
                }

                if (audioContextRef.current) {
                    const ctx = audioContextRef.current;
                    audioContextRef.current = null;
                    if (ctx.state !== 'closed') ctx.close();
                }

                mediaRecorderRef.current = null;
                audioChunksRef.current = [];
                setIsRecording(false);
                setIsPaused(false);

                resolve(audioBlob.size > 0 ? audioBlob : null);
            };

            recorder.onstop = cleanupAndResolve;

            if (recorder.state !== 'inactive') {
                recorder.stop();
            } else {
                cleanupAndResolve();
            }
        });
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
        }
    }, []);

    return { isRecording, isPaused, startRecording, stopRecording, pauseRecording, resumeRecording, error };
};
