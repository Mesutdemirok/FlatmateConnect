import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12" data-testid="error-container">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" data-testid="error-icon" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.error')}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6" data-testid="error-message">
        {message || t('common.error')}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary" data-testid="button-retry">
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}
