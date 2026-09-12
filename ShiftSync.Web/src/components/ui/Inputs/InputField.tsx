import { forwardRef, InputHTMLAttributes } from 'react'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    name: string
    icon?: string
    error?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, name, icon, error, ...props }, ref) => {

        const inputClass = `w-full bg-white/5 border rounded-xl py-4 pr-4 text-white placeholder:text-white/20
      focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/40 focus:outline-none
      transition-all font-body ${icon ? 'pl-12' : 'pl-4'} 
      ${error ? 'border-red-500/60 ring-2 ring-red-500/20' : 'border-white/10'}`

        return (
            <div className="space-y-2 w-full">
                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                    {label}
                </label>
                <div className="relative group">
                    {icon && (
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-cyan transition-colors text-xl">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        name={name}
                        className={inputClass}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-red-400 text-[10px] uppercase tracking-wider ml-1">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

InputField.displayName = 'InputField'