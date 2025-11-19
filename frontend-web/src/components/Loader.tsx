import { useTranslation } from 'react-i18next';

interface LoaderProps {
  message?: string;
}

export function Loader({ message }: LoaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12" data-testid="loader-container">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" data-testid="loader-spinner"></div>
      <p className="mt-4 text-gray-600" data-testid="loader-message">{message || t('common.loading')}</p>
    </div>
  );
}
