import React, { useEffect } from 'react';
import { X, MapPin } from 'lucide-react';

/**
 * @param {Object} props
 * @param {{title: string, location?: string, image: string, fullDesc?: string, desc?: string, tagLabel?: string} | null} props.photo
 * @param {() => void} props.onClose
 */
export default function ImageModal({ photo, onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!photo) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 transform transition-all duration-200"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors focus:outline-none"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Photo */}
                <div className="relative aspect-video w-full bg-gray-950 overflow-hidden">
                    <img
                        src={photo.image}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                    />
                    {photo.tagLabel && (
                        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow">
                            {photo.tagLabel}
                        </span>
                    )}
                </div>

                {/* Details */}
                <div className="p-6 sm:p-7 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {photo.location && (
                            <>
                                <MapPin className="w-3.5 h-3.5 text-red-600" />
                                <span>{photo.location}</span>
                            </>
                        )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                        {photo.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {photo.fullDesc || photo.desc}
                    </p>
                </div>
            </div>
        </div>
    );
}
