import { Suspense } from "react";
import VerifyEmailContent from "./verify-email-content";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="mb-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                ⏳
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Memuat...
            </h1>

            <p className="mt-3 text-sm text-gray-600">
              Sedang memproses halaman verifikasi email.
            </p>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}