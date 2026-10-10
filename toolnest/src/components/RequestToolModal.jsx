
import { useEffect, useState } from 'react';
import { X, Lightbulb, Send, LoaderCircle, CheckCircle2 } from 'lucide-react';
import siteConfig from '../data/siteConfig';

export default function RequestToolModal({ isOpen, onClose }) {
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  // Close the modal when the user presses Escape.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape' && status !== 'submitting') {
        onClose();
      }
    }

    // Prevent the page behind the modal from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, status]);

  // Reset the form when the modal is closed.
  function handleClose() {
    if (status === 'submitting') return;

    setToolName('');
    setDescription('');
    setStatus('idle');
    setError('');
    onClose();
  }

  // Send the request through FormSubmit's AJAX endpoint.
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const cleanName = toolName.trim();
    const cleanDescription = description.trim();

    if (!cleanName || !cleanDescription) {
      setError('Please provide both a tool name and a description.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${siteConfig.requestEmail}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: cleanName,
            message: cleanDescription,
            _subject: `New Toolnest tool request: ${cleanName}`,
            _template: 'table',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success !== 'true') {
        throw new Error('The request could not be submitted.');
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setError(
        'We could not submit your request. Please try again later.'
      );
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        overflow-y-auto bg-black/40 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        // Close only when the backdrop itself is clicked.
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-tool-title"
        className="relative my-auto w-full max-w-lg rounded-3xl
          border border-black/10 bg-white p-6 shadow-2xl
          shadow-black/20 sm:p-8
          dark:border-white/10 dark:bg-[#1b1c19]"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={status === 'submitting'}
          aria-label="Close request form"
          className="absolute right-5 top-5 flex h-9 w-9
            items-center justify-center rounded-xl
            text-neutral-500 transition hover:bg-black/5
            disabled:cursor-not-allowed disabled:opacity-50
            dark:hover:bg-white/10"
        >
          <X size={19} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center
          rounded-2xl bg-emerald-500/10 text-emerald-700
          dark:text-emerald-400">
          <Lightbulb size={24} />
        </div>

        <h2
          id="request-tool-title"
          className="mt-5 text-2xl font-semibold tracking-tight"
        >
          Request a tool
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6
          text-neutral-500 dark:text-neutral-400">
          Have an idea for a useful tool? Tell us about it.
          Your suggestion could become part of Toolnest.
        </p>

        {status === 'success' ? (
          <div className="mt-7 rounded-2xl border border-emerald-500/20
            bg-emerald-500/5 p-5">
            <CheckCircle2
              size={28}
              className="text-emerald-600 dark:text-emerald-400"
            />

            <h3 className="mt-3 font-semibold">
              Request submitted
            </h3>

            <p className="mt-2 text-sm leading-6
              text-neutral-600 dark:text-neutral-300">
              Thank you for helping improve Toolnest. Your request
              has been accepted by the submission service.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-5 w-full rounded-xl bg-[#20211f]
                px-4 py-3 text-sm font-semibold text-white
                transition hover:bg-black
                dark:bg-[#e9e9e2] dark:text-[#20211f]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="requested-tool-name"
                className="mb-2 block text-sm font-medium"
              >
                Tool name <span className="text-red-500">*</span>
              </label>

              <input
                id="requested-tool-name"
                type="text"
                required
                maxLength={100}
                value={toolName}
                onChange={(event) => setToolName(event.target.value)}
                placeholder="e.g. PDF Merger"
                disabled={status === 'submitting'}
                className="w-full rounded-xl border border-black/10
                  bg-[#fafaf9] px-4 py-3 text-sm outline-none
                  transition placeholder:text-neutral-400
                  focus:border-emerald-500 focus:ring-4
                  focus:ring-emerald-500/10
                  disabled:opacity-60
                  dark:border-white/10 dark:bg-[#111210]"
              />
            </div>

            <div>
              <label
                htmlFor="requested-tool-description"
                className="mb-2 block text-sm font-medium"
              >
                Describe the tool{' '}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                id="requested-tool-description"
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What should this tool do? Describe its main features and how you would use it..."
                disabled={status === 'submitting'}
                className="w-full resize-y rounded-xl border
                  border-black/10 bg-[#fafaf9] px-4 py-3
                  text-sm leading-6 outline-none transition
                  placeholder:text-neutral-400 focus:border-emerald-500
                  focus:ring-4 focus:ring-emerald-500/10
                  disabled:opacity-60
                  dark:border-white/10 dark:bg-[#111210]"
              />

              <p className="mt-1 text-right text-xs text-neutral-400">
                {description.length}/3000
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-500/10 px-4 py-3
                  text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                disabled={status === 'submitting'}
                className="flex-1 rounded-xl border border-black/10
                  px-4 py-3 text-sm font-semibold transition
                  hover:bg-black/5 disabled:opacity-50
                  dark:border-white/10 dark:hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex flex-1 items-center justify-center
                  gap-2 rounded-xl bg-emerald-600 px-4 py-3
                  text-sm font-semibold text-white transition
                  hover:bg-emerald-700 disabled:cursor-wait
                  disabled:opacity-70"
              >
                {status === 'submitting' ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <p className="mt-5 text-xs leading-5 text-neutral-400">
          Fields marked with * are required.
        </p>
      </section>
    </div>
  );
}