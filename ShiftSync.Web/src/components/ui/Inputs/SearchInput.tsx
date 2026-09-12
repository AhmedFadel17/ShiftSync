import React from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Search...", className = "" }) => {
    return (
        <div className={`flex items-center glass-card border border-white/5 rounded-2xl overflow-hidden focus-within:border-white/20 transition-all duration-300 ${className}`}>
            <input
                type="text"
                placeholder={placeholder}
                className="bg-transparent border-none outline-none px-5 py-3 text-white text-sm w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="px-4 py-3 bg-white/5 text-white/60 border-l border-white/5">
                <span className="material-symbols-outlined text-lg text-white/40">search</span>
            </div>
        </div>
    );
};

export default SearchInput;
