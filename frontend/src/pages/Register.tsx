import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, isLoading } = useAuthStore();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register({ username, email, password });
        } catch (err: any) {
            setError(err);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-tg-dark p-4">
            <div className="w-full max-w-[400px] bg-tg-panel rounded-2xl p-8 shadow-lg border border-white/5">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#a855f7] flex items-center justify-center text-white mb-4 shadow-md">
                        <MessageSquare size={32} strokeWidth={2} />
                    </div>
                    <h1 className="text-2xl font-bold text-tg-text mb-1">Join telechat</h1>
                    <p className="text-tg-muted text-[15px]">
                        Please enter your info
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 border-b border-white/10 pb-4 mb-2">
                        <label className="text-[14px] font-medium text-tg-muted ml-1">Full Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-tg-dark border border-white/5 rounded-xl px-4 py-3 text-tg-text text-[15px] outline-none focus:border-tg-badge focus:ring-1 focus:ring-tg-badge transition-all"
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-tg-muted ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-tg-dark border border-white/5 rounded-xl px-4 py-3 text-tg-text text-[15px] outline-none focus:border-tg-badge focus:ring-1 focus:ring-tg-badge transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-tg-muted ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-tg-dark border border-white/5 rounded-xl px-4 py-3 text-tg-text text-[15px] outline-none focus:border-tg-badge focus:ring-1 focus:ring-tg-badge transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-tg-badge hover:bg-[#4396d1] text-white rounded-xl py-3.5 mt-2 font-medium text-[16px] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        SIGN UP
                    </button>
                </form>

                {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

                <p className="text-center text-[15px] text-tg-muted mt-6">
                    <Link to="/login" className="text-tg-badge hover:underline font-medium">
                        Already have an account?
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
