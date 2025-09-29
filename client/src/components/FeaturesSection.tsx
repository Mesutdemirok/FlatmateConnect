import { Shield, Users, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FeaturesSection() {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Shield,
      titleKey: "features.verified_profiles.title",
      descriptionKey: "features.verified_profiles.description",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Users,
      titleKey: "features.smart_matching.title",
      descriptionKey: "features.smart_matching.description",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: MessageSquare,
      titleKey: "features.secure_messaging.title",
      descriptionKey: "features.secure_messaging.description",
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  return (
    <section className="py-16 bg-background" data-testid="features-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="features-title">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="features-subtitle">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center" data-testid={`feature-${index}`}>
                <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid={`feature-title-${index}`}>
                  {t(feature.titleKey)}
                </h3>
                <p className="text-muted-foreground" data-testid={`feature-description-${index}`}>
                  {t(feature.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
