import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail, ShieldCheck, UserPlus, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export type AuthPageMode = 'login' | 'signup' | 'forgot-password';

interface AuthPageProps {
  mode: AuthPageMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithOAuth, signInWithMagicLink, requestPasswordReset } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/editor" replace />;
  }

  const clearFeedback = () => {
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/editor');
      }
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Compte cree. Verifie ton email pour confirmer ton inscription.');
      }
      setLoading(false);
      return;
    }

    const result = await requestPasswordReset(email);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage('Un email de reinitialisation vient d etre envoye.');
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    clearFeedback();
    setLoading(true);
    const result = await signInWithMagicLink(email);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage('Lien magique envoye. Verifie ta boite mail.');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    clearFeedback();
    setLoading(true);
    await signInWithOAuth(provider);
  };

  const isForgotMode = mode === 'forgot-password';
  const isSignupMode = mode === 'signup';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#09090b] text-neutral-900 dark:text-white relative overflow-hidden px-6 py-10">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-blue-500/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-md mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour a l'accueil
        </Link>

        <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-5">
            <Zap className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login' && 'Connexion'}
            {isSignupMode && 'Creer un compte'}
            {isForgotMode && 'Mot de passe oublie'}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            {mode === 'login' && 'Connecte-toi pour commencer a creer.'}
            {isSignupMode && "Cree ton compte pour acceder a l'editeur."}
            {isForgotMode && 'Entre ton email pour recevoir un lien de reinitialisation.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {!isForgotMode && (
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="password">
                  Mot de passe
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading
                ? 'Chargement...'
                : mode === 'login'
                  ? 'Se connecter'
                  : isSignupMode
                    ? 'Creer mon compte'
                    : 'Envoyer le lien'}
            </button>
          </form>

          {mode === 'login' && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                <span className="text-xs text-neutral-500">ou</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
                >
                  Continuer avec Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
                >
                  Continuer avec GitHub
                </button>
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                  className="w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
                >
                  Se connecter avec un lien magique
                </button>
              </div>
            </>
          )}

          <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
            {mode === 'login' && (
              <>
                <p>
                  Pas encore de compte ?{' '}
                  <Link to="/auth/signup" onClick={clearFeedback} className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5" />
                    Inscription
                  </Link>
                </p>
                <p>
                  Mot de passe perdu ?{' '}
                  <Link to="/auth/forgot-password" onClick={clearFeedback} className="text-blue-600 dark:text-blue-400 hover:underline">
                    Reinitialiser
                  </Link>
                </p>
              </>
            )}

            {isSignupMode && (
              <p>
                Deja un compte ?{' '}
                <Link to="/auth/login" onClick={clearFeedback} className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Connexion
                </Link>
              </p>
            )}

            {isForgotMode && (
              <p>
                Retour a la{' '}
                <Link to="/auth/login" onClick={clearFeedback} className="text-blue-600 dark:text-blue-400 hover:underline">
                  connexion
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
