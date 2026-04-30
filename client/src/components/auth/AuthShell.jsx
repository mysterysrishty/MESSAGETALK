import React from "react";

const AuthShell = ({ eyebrow, title, subtitle, footer, children }) => {
  return (
    <div className="min-h-screen bg-[#0b141a] md:px-6 md:py-8">
      <div className="mx-auto flex min-h-screen max-w-6xl items-stretch md:min-h-0 md:items-center">
        <div className="grid w-full overflow-hidden bg-[#111b21] md:min-h-[720px] md:grid-cols-[1.05fr_0.95fr] md:rounded-[32px] md:border md:border-[#233138] md:shadow-panel">
          <section className="relative hidden overflow-hidden bg-[#103529] md:flex md:flex-col md:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,168,132,0.28),transparent_32%),radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#123c2e_0%,#0d281f_100%)]" />
            <div className="relative p-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a884] text-lg font-bold text-[#0b141a]">
                  M
                </div>
                <span>MsgMate Secure Chat</span>
              </div>
            </div>

            <div className="relative px-10 pb-10">
              <div className="max-w-md">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#7fe7c8]">
                  {eyebrow}
                </p>
                <h1 className="text-5xl font-semibold leading-[1.05] text-white">
                  Conversations with a sharper edge.
                </h1>
                <p className="mt-5 text-base leading-7 text-white/75">
                  Built for smooth communication, expressive profiles, and a
                  workspace that feels modern from the first click.
                </p>
              </div>

              <div className="mt-12 grid max-w-md grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    Fast
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Real-time updates
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    Personal
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Custom display pictures
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="chat-pattern flex min-h-screen flex-col justify-center px-5 py-8 sm:px-8 md:min-h-0 md:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 text-center md:hidden">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00a884] text-2xl font-bold text-[#0b141a] shadow-lg shadow-[#00a884]/20">
                  M
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#7fe7c8]">
                  {eyebrow}
                </p>
              </div>

              <div className="rounded-[28px] border border-[#233138] bg-[#111b21]/92 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8 md:border-none md:bg-transparent md:p-0 md:shadow-none">
                <div className="mb-8">
                  <p className="hidden text-sm font-semibold uppercase tracking-[0.22em] text-[#7fe7c8] md:block">
                    {eyebrow}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#9cb0b8]">
                    {subtitle}
                  </p>
                </div>

                {children}

                {footer ? (
                  <div className="mt-8 border-t border-[#223239] pt-5 text-center text-sm text-[#9cb0b8]">
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
