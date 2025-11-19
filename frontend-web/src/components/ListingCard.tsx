import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Home, Users } from 'lucide-react';
import { FeedItem } from '@/types';

interface ListingCardProps {
  item: FeedItem;
}

export function ListingCard({ item }: ListingCardProps) {
  const { t } = useTranslation();

  if (item.type === 'seeker') {
    return (
      <div
        className="card hover:shadow-md transition-shadow flex flex-col h-full"
        data-testid={`card-seeker-${item.id}`}
      >
        <div className="aspect-square bg-gray-200 relative overflow-hidden">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.displayName}
              className="w-full h-full object-cover"
              data-testid={`img-seeker-${item.id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <Users className="w-16 h-16 text-primary-600" />
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1" data-testid={`text-seeker-name-${item.id}`}>
            {item.displayName}
          </h3>
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            {item.age && (
              <p data-testid={`text-seeker-age-${item.id}`}>{item.age} yaşında</p>
            )}
            {item.occupation && (
              <p data-testid={`text-seeker-occupation-${item.id}`}>{item.occupation}</p>
            )}
            {item.preferredLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span data-testid={`text-seeker-location-${item.id}`}>{item.preferredLocation}</span>
              </div>
            )}
          </div>
          {item.budgetMonthly && (
            <div className="mt-auto pt-3 border-t border-gray-200">
              <p className="text-lg font-bold text-primary-600" data-testid={`text-seeker-budget-${item.id}`}>
                ₺{item.budgetMonthly.toLocaleString('tr-TR')}
                <span className="text-sm font-normal text-gray-600">{t('common.perMonth')}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const displayImage = item.images && item.images.length > 0 ? item.images[0] : null;
  const location = [item.neighborhood, item.district, item.city].filter(Boolean).join(', ');

  return (
    <Link
      to={`/oda-ilani/${item.slug}`}
      className="card hover:shadow-md transition-shadow flex flex-col h-full"
      data-testid={`card-listing-${item.id}`}
    >
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage.startsWith('http') ? displayImage : `/api/proxy/${displayImage}`}
            alt={item.title}
            className="w-full h-full object-cover"
            data-testid={`img-listing-${item.id}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Home className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid={`text-listing-title-${item.id}`}>
          {item.title}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1" data-testid={`text-listing-location-${item.id}`}>{location}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {item.totalRooms && (
            <span data-testid={`text-listing-rooms-${item.id}`}>
              {item.totalRooms} {t('listing.rooms')}
            </span>
          )}
          {item.totalOccupants && (
            <span data-testid={`text-listing-occupants-${item.id}`}>
              {item.totalOccupants} {t('listing.roommates')}
            </span>
          )}
        </div>
        <div className="mt-auto pt-3 border-t border-gray-200">
          <p className="text-2xl font-bold text-primary-600" data-testid={`text-listing-rent-${item.id}`}>
            ₺{item.rentAmount?.toLocaleString('tr-TR')}
            <span className="text-sm font-normal text-gray-600">{t('listing.month')}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
