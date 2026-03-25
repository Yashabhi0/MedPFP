import { useEffect, useState } from 'react';
import { MapPin, Phone, Star, Stethoscope, Hospital, UserRound, Map, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProfileDropdown from '@/components/auth/ProfileDropdown';
import { Bell } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────
interface Doctor {
  name:      string;
  lat:       number;
  lng:       number;
  specialty: string;
  phone:     string | null;
  address:   string | null;
  opening:   string | null;
  // fallback-only fields
  rating?:   number;
  distance?: string;
  hospital?: string;
  experience?: string;
}

// ── Fallback static data ──────────────────────────────────────────────────
const FALLBACK: Doctor[] = [
  { name: 'Dr. Ramesh Kumar',  lat: 0, lng: 0, specialty: 'Cardiologist',              phone: null, address: 'Apollo Hospital',   opening: null, rating: 4.5, distance: '2.1 km', hospital: 'Apollo Hospital',  experience: '12 yrs' },
  { name: 'Dr. Priya Sharma',  lat: 0, lng: 0, specialty: 'Cardiologist',              phone: null, address: 'Care Hospital',     opening: null, rating: 4.7, distance: '3.4 km', hospital: 'Care Hospital',    experience: '9 yrs'  },
  { name: 'Dr. Anil Mehta',    lat: 0, lng: 0, specialty: 'Interventional Cardiology', phone: null, address: 'Fortis Hospital',   opening: null, rating: 4.3, distance: '4.0 km', hospital: 'Fortis Hospital',  experience: '15 yrs' },
  { name: 'Dr. Sunita Rao',    lat: 0, lng: 0, specialty: 'Cardiologist',              phone: null, address: 'Manipal Hospital',  opening: null, rating: 4.8, distance: '5.2 km', hospital: 'Manipal Hospital', experience: '18 yrs' },
  { name: 'Dr. Vikram Nair',   lat: 0, lng: 0, specialty: 'Cardiac Surgeon',           phone: null, address: 'Narayana Health',  opening: null, rating: 4.6, distance: '6.1 km', hospital: 'Narayana Health',  experience: '20 yrs' },
  { name: 'Dr. Meena Iyer',    lat: 0, lng: 0, specialty: 'Cardiologist',              phone: null, address: 'Columbia Asia',    opening: null, rating: 4.4, distance: '7.3 km', hospital: 'Columbia Asia',    experience: '11 yrs' },
];

const CONDITION = 'BP';
const SPECIALTY = 'Cardiologist';

// ── Helpers ───────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-3.5 h-3.5"
          fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function mapsUrl(lat: number, lng: number, name: string) {
  if (lat !== 0 && lng !== 0) {
    // Real coordinates — drop a pin at exact location
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  // Fallback — search by name
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Doctors() {
  const [doctors,   setDoctors]   = useState<Doctor[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setDoctors(FALLBACK);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res  = await fetch(`/api/nearby-doctors?lat=${coords.latitude}&lng=${coords.longitude}&condition=${CONDITION}`);
          const data = await res.json();

          if (data.success && data.doctors.length > 0) {
            setDoctors(data.doctors);
          } else {
            setDoctors(FALLBACK);
            setIsFallback(true);
          }
        } catch {
          setDoctors(FALLBACK);
          setIsFallback(true);
        } finally {
          setLoading(false);
        }
      },
      () => {
        // Geolocation denied
        setDoctors(FALLBACK);
        setIsFallback(true);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        initialFloating={true}
        links={[
          { label: 'My Passport',      to: '/dashboard' },
          { label: 'Upload Documents', to: '/dashboard/upload' },
          { label: 'Nearby Doctors',   to: '/doctors' },
        ]}
        rightContent={
          <div className="flex items-center gap-3">
            <button className="relative"><Bell className="w-5 h-5 text-muted-foreground" /></button>
            <ProfileDropdown initials="?" />
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Nearby Specialists</h1>
          <p className="text-sm text-muted-foreground">Doctors recommended based on your health conditions</p>
        </div>

        {/* Condition badge */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card shadow-sm text-sm">
            <Stethoscope className="w-4 h-4" style={{ color: '#A8643E' }} />
            <span className="text-muted-foreground">Detected Condition:</span>
            <span className="font-semibold text-foreground">{CONDITION}</span>
            <span className="mx-1 text-border">·</span>
            <span className="text-muted-foreground">Recommended:</span>
            <span className="font-semibold" style={{ color: '#A8643E' }}>{SPECIALTY}</span>
          </div>
        </div>

        {/* Fallback notice */}
        {isFallback && !loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 px-3 py-2 rounded-lg border border-border bg-card w-fit">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Showing sample data — allow location access for real nearby results
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Finding doctors near you…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive py-8 text-center">{error}</div>
        )}

        {/* Doctor grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc, i) => (
              <div
                key={`${doc.name}-${i}`}
                className="card-base card-hover flex flex-col gap-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(168,100,62,0.1)' }}>
                    <UserRound className="w-5 h-5" style={{ color: '#A8643E' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-tight">{doc.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.specialty}</p>
                  </div>
                </div>

                {/* Rating (fallback only) or opening hours */}
                {doc.rating
                  ? <StarRating rating={doc.rating} />
                  : doc.opening && (
                    <p className="text-xs text-muted-foreground">🕐 {doc.opening}</p>
                  )
                }

                {/* Details */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {(doc.hospital ?? doc.address) && (
                    <div className="flex items-center gap-1.5">
                      <Hospital className="w-3.5 h-3.5 shrink-0" />
                      <span>{doc.hospital ?? doc.address}</span>
                    </div>
                  )}
                  {doc.distance && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{doc.distance}</span>
                    </div>
                  )}
                  {doc.experience && (
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                      <span>{doc.experience} experience</span>
                    </div>
                  )}
                  {doc.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{doc.phone}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                  <a
                    href={mapsUrl(doc.lat, doc.lng, doc.hospital ?? doc.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Map className="w-3.5 h-3.5" /> View on Maps
                  </a>
                  {doc.phone ? (
                    <a href={`tel:${doc.phone}`}
                      className="btn-secondary text-xs flex items-center gap-1.5 flex-1 justify-center">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  ) : (
                    <button className="btn-secondary text-xs flex items-center gap-1.5 flex-1 justify-center">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && doctors.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No doctors found nearby.</p>
          </div>
        )}

      </div>
    </div>
  );
}
