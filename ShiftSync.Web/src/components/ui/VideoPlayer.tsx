import { useRef, useState } from "react";

interface VideoPlayerProps {
    videoSource: string;
}

export default function VideoPlayer({ videoSource }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    // Handle play/pause toggles
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().catch(err => console.log("Play interrupted:", err));
            setIsPlaying(true);
        }
    };

    // Time update handler
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Loaded metadata handler
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    // Seek handler
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Volume change handler
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            videoRef.current.muted = vol === 0;
            setIsMuted(vol === 0);
        }
    };

    // Toggle mute
    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        videoRef.current.muted = newMuted;
    };

    // Double check formatting of time string
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    return (
        <div>
            <div className="relative w-full h-full bg-black group/player">
                <video
                    ref={videoRef}
                    src={videoSource}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                    className="w-full h-full object-contain cursor-pointer"
                />



                {/* Cinematic Top Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-[#0b1326]/70 to-transparent">
                    <div className="bg-[#0b1326]/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-label text-[#dae2fd] border border-[#494456]/20">
                        FinalVideo_v2.mp4
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-[#03b5d3]/20 text-[#4cd7f6] px-2.5 py-1 rounded text-xs font-black tracking-widest border border-[#4cd7f6]/20">4K</span>
                    </div>
                </div>

                {/* Center Play/Pause Indicator Button */}
                {!isPlaying && (
                    <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#ddb7ff]/90 hover:bg-[#ddb7ff] text-[#490080] rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_30px_rgba(221,183,255,0.4)] backdrop-blur-sm"
                    >
                        <span className="material-symbols-outlined text-[32px] ml-1 fill-[1]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                        </span>
                    </button>
                )}

                {/* Cinematic Bottom Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#0b1326]/80 to-transparent">
                    {/* Custom Interactive Progress Bar */}
                    <div className="relative w-full flex items-center group/progress">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-[#494456]/30 hover:h-2 rounded-full appearance-none cursor-pointer accent-[#ddb7ff] transition-all"
                        />
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#ddb7ff] to-[#4cd7f6] rounded-full pointer-events-none"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                    </div>

                    {/* Toolbar buttons */}
                    <div className="flex justify-between items-center text-[#dae2fd] px-1">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:text-[#ddb7ff] transition-colors">
                                <span className="material-symbols-outlined text-[22px]">
                                    {isPlaying ? 'pause' : 'play_arrow'}
                                </span>
                            </button>

                            {/* Volume Controls */}
                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="hover:text-[#ddb7ff] transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">
                                        {isMuted || volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                                    </span>
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 overflow-hidden group-hover/volume:w-16 h-1 rounded-full appearance-none cursor-pointer bg-[#494456]/50 accent-[#ddb7ff] transition-all duration-300"
                                />
                            </div>

                            <span className="text-xs font-label text-white/70">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="hover:text-[#ddb7ff] transition-colors">
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                            </button>
                            <button
                                onClick={() => videoRef.current?.requestFullscreen()}
                                className="hover:text-[#ddb7ff] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}