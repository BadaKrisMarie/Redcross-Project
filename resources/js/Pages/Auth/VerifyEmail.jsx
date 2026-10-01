import React from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout
            title="Verify Your Email"
            subtitle="Please check your inbox to activate your volunteer account"
        >
            <Head title="Email Verification - Philippine Red Cross" />

            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just sent to you? If you didn't receive the email, we will gladly send you another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 pt-2">
                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Resending...' : 'Resend Verification Email'}
                </PrimaryButton>

                <div className="text-center pt-2">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
