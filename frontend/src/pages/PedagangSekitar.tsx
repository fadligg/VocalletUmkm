import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, type MapRef, MapMarker, MarkerContent, MarkerPopup, MapRoute, MapGeoJSON } from '../components/ui/map';
import { Store, Navigation, Map as MapIcon, ChevronRight } from 'lucide-react';
import { getDistance, formatDistance } from '../lib/utils';

const mapStyles = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
  openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

type StyleKey = keyof typeof mapStyles;

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

interface Seller {
  id: number;
  name: string;
  type: string;
  logo?: string;
  lng: number;
  lat: number;
  distance: string;
}

const PedagangSekitar: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<MapRef>(null);
  const [style, setStyle] = useState<StyleKey>("openstreetmap");
  const selectedStyle = mapStyles[style];
  const [is3D, setIs3D] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lng: number, lat: number} | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filterRange, setFilterRange] = useState<number>(2000); // Default 2km
  const [selectedRoute, setSelectedRoute] = useState<[number, number][] | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Ref to hold latest state for interval closure
  const locationRef = useRef<{lng: number, lat: number} | null>(null);

  useEffect(() => {
    locationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    document.title = 'Pedagang Sekitar';
    window.scrollTo(0, 0);

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
      if (!currentLoc) return;

      const token = localStorage.getItem('vocallet_token');
      const email = localStorage.getItem('vocallet_user_email') || 'Pembeli';

      if (token) {
        // Broadcast lokasi pembeli agar terlihat oleh UMKM di PelangganSekitar
        fetch('https://menu.co-id.id/vocallet/api/locations/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            lat: currentLoc.lat,
            lng: currentLoc.lng,
            role: 'individual',
            metadata: { name: email }
          })
        }).catch(err => console.error("Error broadcasting location:", err));

        // Ambil daftar UMKM dari database lokal
        fetch('http://localhost:5001/api/business/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then((data: any) => {
          if (data.businesses && Array.isArray(data.businesses)) {
            const parsedSellers = data.businesses.map((b: any) => {
              const dist = getDistance(currentLoc.lat, currentLoc.lng, b.latitude, b.longitude);
              return {
                id: b.userId,
                name: b.namaUsaha || "UMKM Anonim",
                type: b.jenisUsaha || "UMKM",
                logo: b.logoUrl || null,
                lat: b.latitude,
                lng: b.longitude,
                distance: formatDistance(dist)
              };
            });
            setSellers(parsedSellers);
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

  const filteredSellers = sellers.filter(s => getDistance(userLocation?.lat || 0, userLocation?.lng || 0, s.lat, s.lng) <= filterRange);

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
    <div className="min-h-screen bg-[#f0f7ff] text-gray-900 flex flex-col antialiased relative w-full">
      {/* Header Bar */}
      <header className="w-full py-4 px-6 flex items-center justify-between border-b border-blue-100/50 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-lg md:text-xl text-blue-900 tracking-wide">
            Pedagang Sekitar
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 hidden sm:inline">Jarak:</span>
          <select 
            value={filterRange}
            onChange={(e) => setFilterRange(Number(e.target.value))}
            className="bg-white/90 border border-blue-100 text-blue-600 font-bold rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 outline-none shadow-sm transition-all hover:bg-blue-50/50"
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
        
        <div className="flex flex-col md:flex-row md:items-center justify-end p-4 bg-white/95 backdrop-blur-sm shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] z-10 relative gap-4 rounded-b-3xl mb-2">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Tampilan Peta:</span>
            <select
              value={style}
              onChange={(e) => {
                setStyle(e.target.value as StyleKey);
                setIs3D(e.target.value === "openstreetmap3d");
              }}
              className="bg-slate-50 text-blue-600 font-bold rounded-xl border border-blue-100 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-full md:w-auto transition-all hover:bg-blue-50/50"
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
                  fillPaint={{ "fill-color": "#3b82f6", "fill-opacity": 0.15 }}
                  linePaint={{ "line-color": "#2563eb", "line-width": 2, "line-dasharray": [2, 2] }}
                />
              )}

              {/* Rute Jalan */}
              {selectedRoute && (
                <MapRoute coordinates={selectedRoute} color="#2563eb" width={4} opacity={0.8} />
              )}

              {/* Marker Pembeli (Anda) */}
              <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
                <MarkerContent>
                  <div className="relative h-14 w-14 rounded-full border-[3px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-gradient-to-tr from-blue-600 to-sky-400 ring-4 ring-blue-500/30 flex items-center justify-center z-20 overflow-hidden transition-transform duration-500 hover:scale-110 cursor-pointer">
                    <span className="text-[10px] text-white font-extrabold">ANDA</span>
                  </div>
                </MarkerContent>
              </MapMarker>

              {/* Marker Pedagang (Sellers) */}
              {filteredSellers.map((seller) => (
              <MapMarker key={seller.id} longitude={seller.lng} latitude={seller.lat}>
                <MarkerContent>
                  <div className="relative h-12 w-12 rounded-full border-[3px] border-white bg-green-500 shadow-lg flex items-center justify-center overflow-hidden transition-transform hover:scale-110">
                    {seller.logo ? (
                      <img src={seller.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="text-white w-6 h-6" />
                    )}
                  </div>
                </MarkerContent>
                <MarkerPopup className="min-w-[160px] max-w-[200px]">
                  <div className="flex flex-col gap-1.5 p-1">
                    <span className="font-bold text-sm text-gray-900 leading-tight">{seller.name}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded-full">{seller.type}</span>
                      <span className="text-xs font-bold text-gray-500">{seller.distance}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleDrawRoute(seller.lat, seller.lng)} className="flex-1 bg-blue-50 text-blue-600 text-[10px] font-bold py-1.5 rounded hover:bg-blue-100 transition-colors flex items-center justify-center shadow-sm gap-1">
                        <Navigation className="w-3 h-3" /> Rute
                      </button>
                      <button onClick={() => handleOpenGmaps(seller.lat, seller.lng)} className="flex-1 bg-[#0b7b3f] text-white text-[10px] font-bold py-1.5 rounded hover:bg-[#096634] transition-colors flex items-center justify-center shadow-sm gap-1">
                        <MapIcon className="w-3 h-3" /> Gmaps
                      </button>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            ))}
          </Map>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></span>
              <p className="text-sm font-bold text-gray-500">Mencari lokasi GPS Anda...</p>
            </div>
          )}
        </div>

        {/* List UMKM */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-sm font-black text-gray-800 tracking-wide">Daftar Pedagang ({filteredSellers.length})</h2>
            {isRouting && <span className="text-xs font-bold text-blue-500 animate-pulse">Menghitung rute...</span>}
          </div>
          
          <div className="flex flex-col gap-3">
            {filteredSellers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm font-bold">Tidak ada pedagang aktif dalam radius {filterRange < 1000 ? `${filterRange}m` : `${filterRange/1000}km`}.</div>
            ) : (
              filteredSellers.map(seller => (
                <div key={seller.id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md border border-gray-100/60 flex items-center gap-4 transition-all duration-300 transform hover:-translate-y-0.5 group">
                  <div className="w-14 h-14 shrink-0 rounded-full border-2 border-green-50 overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 group-hover:scale-105 transition-transform duration-300">
                    {seller.logo ? (
                      <img src={seller.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">{seller.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-100">{seller.type}</span>
                      <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Navigation className="w-3 h-3 text-slate-400" /> {seller.distance}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button 
                      onClick={() => navigate(`/toko/${seller.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 transition-all active:scale-95 shadow-sm hover:shadow-md shadow-blue-500/20"
                      aria-label="Profil Toko"
                    >
                      <ChevronRight className="w-5 h-5" />
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

export default PedagangSekitar;
