import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, type MapRef, MapMarker, MarkerContent, MarkerPopup, MapRoute, MapGeoJSON } from '../components/ui/map';
import { ArrowLeft, UserCircle2, Navigation, Map as MapIcon } from 'lucide-react';
import { getDistance, formatDistance } from '../lib/utils';

const mapStyles = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
  openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

type StyleKey = keyof typeof mapStyles;

// Function to generate a GeoJSON Polygon approximating a circle
function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points: number = 64) {
  const coords = [];
  const distanceX = radiusInMeters / (111320 * Math.cos(center[1] * Math.PI / 180));
  const distanceY = radiusInMeters / 110574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // close the polygon

  return {
    type: "FeatureCollection" as const,
    features: [{
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [coords]
      }
    }]
  };
}

interface Buyer {
  id: number;
  name: string;
  lng: number;
  lat: number;
  distance: string;
}

const PelangganSekitar: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<MapRef>(null);
  const [style, setStyle] = useState<StyleKey>("openstreetmap");
  const selectedStyle = mapStyles[style];
  const [is3D, setIs3D] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [logoUsaha, setLogoUsaha] = useState<string | null>(null);
  const [namaUsaha, setNamaUsaha] = useState<string>('UMKM');
  
  const [userLocation, setUserLocation] = useState<{lng: number, lat: number} | null>(null);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filterRange, setFilterRange] = useState<number>(2000); // Default 2km
  const [selectedRoute, setSelectedRoute] = useState<[number, number][] | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Ref to hold latest state for interval closure
  const locationRef = useRef<{lng: number, lat: number} | null>(null);
  const isActiveRef = useRef(isActive);
  const metadataRef = useRef({ namaUsaha, logoUsaha });

  useEffect(() => {
    locationRef.current = userLocation;
    isActiveRef.current = isActive;
    metadataRef.current = { namaUsaha, logoUsaha };
  }, [userLocation, isActive, namaUsaha, logoUsaha]);

  useEffect(() => {
    document.title = 'Pelanggan Sekitar';
    window.scrollTo(0, 0);
    
    // Fetch initial status from backend
    const token = localStorage.getItem('vocallet_token');
    if (token) {
      fetch('https://menu.co-id.id/vocallet/api/umkm-details', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.is_active !== 'undefined') {
          setIsActive(data.is_active);
          localStorage.setItem('vocallet_umkm_active', String(data.is_active));
        }
        if (data && data.logo_usaha) {
          setLogoUsaha(data.logo_usaha);
          localStorage.setItem('vocallet_logo_usaha', data.logo_usaha);
        }
        if (data && data.nama_usaha) {
          setNamaUsaha(data.nama_usaha);
          localStorage.setItem('vocallet_nama_usaha', data.nama_usaha);
        }
        if (data && data.tipe_usaha) {
          localStorage.setItem('vocallet_tipe_usaha', data.tipe_usaha);
        }
      })
      .catch(err => console.error("Gagal mengambil detail UMKM:", err));
    }

    // Get user GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Akses GPS ditolak atau gagal. Menampilkan lokasi default.");
          setUserLocation({ lat: -6.175110, lng: 106.827153 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Browser Anda tidak mendukung Geolocation.");
      setUserLocation({ lat: -6.175110, lng: 106.827153 });
    }

    // Real-time Polling Interval (setiap 5 detik)
    const interval = setInterval(() => {
      const currentLoc = locationRef.current;
      const currentIsActive = isActiveRef.current;
      const currentMeta = metadataRef.current;
      
      if (!currentIsActive || !currentLoc) return; // Jangan push/tarik jika non-aktif

      const token = localStorage.getItem('vocallet_token');
      if (token) {
        fetch('https://menu.co-id.id/vocallet/api/locations/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            lat: currentLoc.lat,
            lng: currentLoc.lng,
            role: 'umkm',
            metadata: {
              nama_usaha: currentMeta.namaUsaha,
              logo_usaha: currentMeta.logoUsaha
            }
          })
        })
        .then(res => res.json())
        .then((data: any[]) => {
          if (Array.isArray(data)) {
            const parsedBuyers = data.map(b => {
              let name = "Pembeli anonim";
              if (b.metadata) {
                try {
                  const meta = JSON.parse(b.metadata);
                  if (meta.name) name = meta.name;
                } catch(e){}
              }
              const dist = getDistance(currentLoc.lat, currentLoc.lng, parseFloat(b.lat), parseFloat(b.lng));
              return {
                id: b.user_id,
                name: name,
                lat: parseFloat(b.lat),
                lng: parseFloat(b.lng),
                distance: formatDistance(dist)
              };
            });
            setBuyers(parsedBuyers);
          }
        })
        .catch(err => console.error("Error polling locations:", err));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.easeTo({ pitch: is3D ? 60 : 0, duration: 500 });
    }
  }, [is3D]);

  const filteredBuyers = buyers.filter(b => getDistance(userLocation?.lat || 0, userLocation?.lng || 0, b.lat, b.lng) <= filterRange);

  const handleDrawRoute = async (destLat: number, destLng: number) => {
    if (!userLocation) return;
    setIsRouting(true);
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destLng},${destLat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        setSelectedRoute(data.routes[0].geometry.coordinates);
      }
    } catch (e) {
      console.error('Routing error:', e);
    } finally {
      setIsRouting(false);
    }
  };

  const handleOpenGmaps = (destLat: number, destLng: number) => {
    if (!userLocation) return;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col antialiased relative w-full">
      {/* Header Bar */}
      <header className="w-full py-4 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border-b border-gray-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="font-extrabold text-lg md:text-xl text-gray-900 tracking-wide">
            Pelanggan Sekitar
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 hidden sm:inline">Jarak:</span>
          <select 
            value={filterRange}
            onChange={(e) => setFilterRange(Number(e.target.value))}
            className="bg-white/90 border border-emerald-100 text-[#0b7b3f] font-bold rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#0b7b3f]/30 outline-none shadow-sm transition-all hover:bg-emerald-50/50"
          >
            <option value={500}>500m</option>
            <option value={1000}>1 KM</option>
            <option value={2000}>2 KM</option>
            <option value={5000}>5 KM</option>
            <option value={100000}>Semua</option>
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full relative flex flex-col pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/95 backdrop-blur-sm shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] z-10 relative gap-4 rounded-b-3xl mb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">Status Toko:</span>
            <button 
              onClick={() => {
                const newStatus = !isActive;
                setIsActive(newStatus);
                localStorage.setItem('vocallet_umkm_active', String(newStatus));
                const token = localStorage.getItem('vocallet_token');
                if (token) {
                  fetch('https://menu.co-id.id/vocallet/api/umkm-details', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ is_active: newStatus })
                  }).catch(err => console.error("Gagal update status toko:", err));
                }
              }}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b7b3f] ${isActive ? 'bg-gradient-to-r from-[#0b7b3f] to-emerald-400 shadow-md shadow-emerald-500/20' : 'bg-slate-300'}`}
              aria-label="Toggle status toko"
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-bold transition-colors ${isActive ? 'text-[#0b7b3f]' : 'text-slate-400'}`}>
              {isActive ? 'Aktif (Terlihat oleh pembeli)' : 'Non-aktif (Tersembunyi)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Tampilan Peta:</span>
            <select
              value={style}
              onChange={(e) => {
                setStyle(e.target.value as StyleKey);
                setIs3D(e.target.value === "openstreetmap3d");
              }}
              className="bg-slate-50 text-[#0b7b3f] font-bold rounded-xl border border-emerald-100 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0b7b3f]/30 w-full md:w-auto transition-all hover:bg-emerald-50/50"
            >
              <option value="default">Default (Carto)</option>
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="openstreetmap3d">OpenStreetMap 3D</option>
            </select>
          </div>
        </div>

        {locationError && (
          <div className="bg-red-50 text-red-600 text-xs p-2 text-center border-b border-red-100">
            {locationError}
          </div>
        )}

        <div className="relative w-full h-[40vh] md:h-[50vh] shrink-0 border-b border-gray-200 overflow-hidden shadow-inner bg-gray-100">
          {userLocation ? (
            <Map
              ref={mapRef}
              className="absolute inset-0 h-full w-full"
              center={[userLocation.lng, userLocation.lat]}
              zoom={14}
              styles={
                selectedStyle
                  ? { light: selectedStyle, dark: selectedStyle }
                  : undefined
              }
            >
              {/* Range Overlay */}
              {userLocation && filterRange < 100000 && (
                <MapGeoJSON
                  data={createGeoJSONCircle([userLocation.lng, userLocation.lat], filterRange)}
                  fillPaint={{ "fill-color": "#10b981", "fill-opacity": 0.15 }}
                  linePaint={{ "line-color": "#0b7b3f", "line-width": 2, "line-dasharray": [2, 2] }}
                />
              )}

              {/* Rute Jalan */}
              {selectedRoute && (
                <MapRoute coordinates={selectedRoute} color="#006B2C" width={4} opacity={0.8} />
              )}

              {/* Marker Penjual (Anda) */}
              <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
                <MarkerContent>
                  <div className={`relative h-14 w-14 rounded-full border-[3px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center z-20 overflow-hidden transition-transform duration-500 hover:scale-110 cursor-pointer ${isActive ? 'bg-gradient-to-tr from-[#0b7b3f] to-emerald-400 ring-4 ring-emerald-500/30' : 'bg-slate-400'}`}>
                    {logoUsaha ? (
                      <img src={logoUsaha} alt="Logo Usaha" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-white font-extrabold">ANDA</span>
                    )}
                  </div>
                </MarkerContent>
                <MarkerPopup className="min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
                      {logoUsaha ? (
                        <img src={logoUsaha} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-[#0b7b3f] font-black">UMKM</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{namaUsaha}</p>
                      <p className="text-[9px] font-semibold text-emerald-600">Toko Anda</p>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>

              {/* Marker Pembeli (Hanya muncul jika toko aktif) */}
              {isActive && filteredBuyers.map((buyer) => (
              <MapMarker key={buyer.id} longitude={buyer.lng} latitude={buyer.lat}>
                <MarkerContent>
                  <div className="relative h-10 w-10 rounded-full border-[3px] border-white bg-blue-500 shadow-lg flex items-center justify-center transition-transform hover:scale-110">
                    <UserCircle2 className="text-white w-5 h-5" />
                  </div>
                </MarkerContent>
                <MarkerPopup className="min-w-[150px]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">{buyer.name}</p>
                      <p className="text-[10px] font-semibold text-gray-500">{buyer.distance}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDrawRoute(buyer.lat, buyer.lng)} className="flex-1 bg-blue-50 text-blue-600 text-[10px] font-bold py-1.5 rounded hover:bg-blue-100 transition-colors flex items-center justify-center shadow-sm">
                      Rute
                    </button>
                    <button onClick={() => handleOpenGmaps(buyer.lat, buyer.lng)} className="flex-1 bg-[#0b7b3f] text-white text-[10px] font-bold py-1.5 rounded hover:bg-[#096634] transition-colors flex items-center justify-center shadow-sm">
                      Gmaps
                    </button>
                  </div>
                </MarkerPopup>
              </MapMarker>
            ))}
          </Map>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-4"></span>
              <p className="text-sm font-bold text-gray-500">Mencari lokasi GPS Anda...</p>
            </div>
          )}
        </div>

        {/* List Pembeli */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 pb-12">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-sm font-black text-gray-800 tracking-wide">Daftar Pembeli ({isActive ? filteredBuyers.length : 0})</h2>
            {isRouting && <span className="text-xs font-bold text-blue-500 animate-pulse">Menghitung rute...</span>}
          </div>
          
          <div className="flex flex-col gap-3">
            {!isActive ? (
              <div className="text-center py-8 text-gray-500 text-sm font-bold">Aktifkan Status Toko Anda untuk melihat pembeli.</div>
            ) : filteredBuyers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm font-bold">Tidak ada pembeli aktif dalam radius {filterRange < 1000 ? `${filterRange}m` : `${filterRange/1000}km`}.</div>
            ) : (
              filteredBuyers.map(buyer => (
                <div key={buyer.id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md border border-gray-100/60 flex items-center gap-4 transition-all duration-300 transform hover:-translate-y-0.5 group">
                  <div className="w-12 h-12 shrink-0 rounded-full border-2 border-blue-50 overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:scale-105 transition-transform duration-300">
                    <UserCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{buyer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">Pembeli</span>
                      <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Navigation className="w-3 h-3 text-slate-400" /> {buyer.distance}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button 
                      onClick={() => handleOpenGmaps(buyer.lat, buyer.lng)}
                      className="bg-[#0b7b3f] hover:bg-[#096634] text-white rounded-xl p-3 transition-all active:scale-95 shadow-sm hover:shadow-md shadow-green-500/20"
                      aria-label="Google Maps"
                    >
                      <MapIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PelangganSekitar;
