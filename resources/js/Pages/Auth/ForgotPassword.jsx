import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout
            title="Reset Password"
            subtitle="Enter your email to receive a password reset link"
        >
            <Head title="Forgot Password - Philippine Red Cross" />

            {/* Status Feedback */}
            {status && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Registered Email Address" />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10"
                            isFocused={true}
                            placeholder="juan@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                    <p className="text-xs text-gray-400 mt-1.5 font-normal">
                        We'll send an official verification link to reset your account credentials.
                    </p>
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {processing ? 'Sending Link...' : 'Send Password Reset Link'}
                    </PrimaryButton>
                </div>

                {/* Back to Sign In */}
                <div className="text-center pt-3 border-t border-gray-100">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}