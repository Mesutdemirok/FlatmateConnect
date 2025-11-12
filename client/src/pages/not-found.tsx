import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" data-testid="icon-alert" />
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-not-found-title">
              {t('errors.page_not_found')}
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600" data-testid="text-page-not-found-description">
            {t('errors.page_not_found_description')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
