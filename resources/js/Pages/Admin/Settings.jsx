import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import { Settings2, MapPinOff, Search, MapPin, Search as SearchIcon } from 'lucide-react';

const defaultIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
}) : null;

class MapErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 w-full h-full bg-rose-50 text-rose-600 flex flex-col items-center justify-center text-center">
                    <MapPinOff className="w-10 h-10 mb-2" />
                    <strong className="font-black">Gagal memuat peta interaktif</strong>
                    <p className="text-xs mt-2 opacity-80">{this.state.error?.message}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

function LocationSelector({ lat, lng, radius, onChange }) {
    const defaultLat = lat ? parseFloat(lat) : -6.200000;
    const defaultLng = lng ? parseFloat(lng) : 106.816666;
    
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([defaultLat, defaultLng], 17); // Selalu dekatkan pandangan (pan-in) ke radius secara jelas 
        }
    }, [lat, lng, map]);

    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
            // map panning akan otomatis ditrigger oleh useEffect di atas ketika state (lat/lng) berubah di parent
        },
    });

    return (
        <React.Fragment>
            {defaultIcon && <Marker position={[defaultLat, defaultLng]} icon={defaultIcon} />}
            {radius > 0 && (
                <Circle 
                    center={[defaultLat, defaultLng]} 
                    radius={parseFloat(radius) || 0} 
                    pathOptions={{ color: '#059669', fillColor: '#059669', fillOpacity: 0.2 }} 
                />
            )}
        </React.Fragment>
    );
}

function LocationSearch({ onLocationSelected }) {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const skipSearch = React.useRef(false);

    React.useEffect(() => {
        if (skipSearch.current) {
            skipSearch.current = false;
            return;
        }

        if (!query.trim() || query.length < 3) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                // limit=5 dan countrycodes=id mempercepat pencarian spesifik Indonesia
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`);
                const data = await res.json();
                setResults(data || []);
                setShowDropdown(true);
            } catch (err) {
                console.error("Geocoding fetch error:", err);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce menghindari spam API

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (item) => {
        skipSearch.current = true; // Mencegah refetch saat kita me-replace isi text input
        onLocationSelected(parseFloat(item.lat), parseFloat(item.lon));
        setQuery(item.display_name.split(',')[0]);
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full">
            <div className="flex gap-2 w-full">
                <input 
                    type="text" 
                    value={query} 
                    onChange={e => {
                        setQuery(e.target.value);
                        if (!showDropdown) setShowDropdown(true);
                    }}
                    placeholder="Ketik lokasi / nama tempat..." 
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-300 outline-none transition" 
                />
                <button 
                    type="button" 
                    disabled={loading || !query.trim()}
                    onClick={() => {
                        if (results.length > 0) handleSelect(results[0]);
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black focus:ring-2 focus:ring-slate-300 disabled:opacity-50 transition min-w-[60px] shadow-sm flex items-center justify-center gap-1"
                >
                    {loading ? (
                        <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <><SearchIcon className="w-3 h-3" /> Cari</>
                    )}
                </button>
            </div>

            {/* Dropdown Autosuggest */}
            {showDropdown && results.length > 0 && (
                <ul className="absolute top-12 left-0 w-full bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden z-[9999] max-h-60 overflow-y-auto divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {results.map((item, i) => (
                        <li 
                            key={i} 
                            onClick={() => handleSelect(item)}
                            className="px-4 py-3 hover:bg-teal-50 cursor-pointer transition text-left group"
                        >
                            <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700">{item.display_name.split(',')[0]}</div>
                            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.display_name}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing, errors } = useForm({
        face_threshold: settings.face_threshold,
        anti_spoofing: settings.anti_spoofing,
        delay_scan: settings.delay_scan,
        attendance_mode: settings.attendance_mode,
        office_lat: settings.office_lat,
        office_lon: settings.office_lon,
        office_radius: settings.office_radius
    });

    useEffect(() => {
        // PENTING: Hanya Auto-detect lokasi JIKA admin BELUM PERNAH mensave koordinat kantor!
        if (!settings.is_location_set && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                setData(currentData => ({
                    ...currentData,
                    office_lat: position.coords.latitude.toFixed(6),
                    office_lon: position.coords.longitude.toFixed(6)
                }));
            }, () => {
                console.log("Akses GPS ditolak / tidak tersedia otomatis.");
            });
        }
    }, [settings.is_location_set]);

    const submitForm = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <Settings2 className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Pengaturan Sistem</h2>
                </div>
            }
        >
            <Head title="Pengaturan Global" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <form onSubmit={submitForm} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-100/50">
                                <Settings2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-slate-900">Biometric & Geo Settings</h3>
                                <p className="text-slate-500 text-sm font-medium mt-0.5">Atur tingkat keamanan, mode absensi, dan area geo-fencing.</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Threshold Akurasi */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Tingkat Akurasi (Threshold)</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                            Makin kecil = Makin ketat pencocokan wajah.
                                        </p>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-black border border-emerald-200/50">
                                        {data.face_threshold}
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.2" max="0.7" step="0.05"
                                    value={data.face_threshold}
                                    onChange={e => setData('face_threshold', e.target.value)}
                                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 font-black mt-2">
                                    <span>Tinggi (0.2)</span>
                                    <span>Default (0.45)</span>
                                    <span>Rendah (0.7)</span>
                                </div>
                                {errors.face_threshold && <p className="text-rose-500 text-xs mt-2 font-semibold">{errors.face_threshold}</p>}
                            </div>

                            {/* Anti Spoofing & Mode */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Anti-Fake (Liveness Detection)
                                    </label>
                                    <select 
                                        value={data.anti_spoofing}
                                        onChange={e => setData('anti_spoofing', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 outline-none"
                                    >
                                        <option value="true">Aktif (Cegah deteksi foto/video)</option>
                                        <option value="false">Nonaktif (Gunakan scan ganda)</option>
                                    </select>
                                    {errors.anti_spoofing && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.anti_spoofing}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Delay Scan (Menit)
                                    </label>
                                    <input 
                                        type="number" min="0" 
                                        value={data.delay_scan}
                                        onChange={e => setData('delay_scan', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 outline-none"
                                        placeholder="Cth: 30"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Cegah double absen dalam sela waktu ini.</p>
                                    {errors.delay_scan && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.delay_scan}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Mode Absensi
                                    </label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 border-2 rounded-xl text-center py-4 cursor-pointer transition ${data.attendance_mode === 'checkin_checkout' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                            <input type="radio" value="checkin_checkout" className="hidden" checked={data.attendance_mode === 'checkin_checkout'} onChange={e => setData('attendance_mode', e.target.value)} />
                                            <div className="font-bold mb-1">In & Out</div>
                                            <div className="text-[10px] opacity-70">Check-in dan Check-out</div>
                                        </label>
                                        <label className={`flex-1 border-2 rounded-xl text-center py-4 cursor-pointer transition ${data.attendance_mode === 'checkin_only' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                            <input type="radio" value="checkin_only" className="hidden" checked={data.attendance_mode === 'checkin_only'} onChange={e => setData('attendance_mode', e.target.value)} />
                                            <div className="font-bold mb-1">In Only</div>
                                            <div className="text-[10px] opacity-70">Hanya sekali absen/hari</div>
                                        </label>
                                    </div>
                                    {errors.attendance_mode && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.attendance_mode}</p>}
                                </div>
                            </div>

                            {/* Geofencing Settings */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6 md:col-span-2">
                                <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-emerald-600 mb-0.5" />
                                            <h4 className="font-bold text-slate-800">Geofencing (Validasi Lokasi GPS)</h4>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                            Cari area atau geser map dan klik untuk menaruh tiang pusat absensi kantor.
                                        </p>
                                    </div>
                                    <div className="flex w-full md:w-auto items-center gap-2">
                                        <div className="flex-1 lg:w-[250px]">
                                            <LocationSearch 
                                                onLocationSelected={(lat, lng) => {
                                                    setData(currentData => ({ 
                                                        ...currentData, 
                                                        office_lat: lat.toFixed(6), 
                                                        office_lon: lng.toFixed(6) 
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <span className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-black hidden sm:flex items-center shadow-sm whitespace-nowrap gap-1 border border-slate-700">
                                            <MapPin className="w-3 h-3 text-emerald-400" /> Radius: {data.office_radius}m
                                        </span>
                                    </div>
                                </div>

                                {/* Interactive Map block */}
                                <div className="h-72 w-full rounded-2xl overflow-hidden mb-6 z-0 relative border-[6px] border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] bg-slate-50 flex items-center justify-center">
                                    <MapErrorBoundary>
                                        <MapContainer 
                                            center={[data.office_lat ? parseFloat(data.office_lat) : -6.200000, data.office_lon ? parseFloat(data.office_lon) : 106.816666]} 
                                            zoom={17} 
                                            style={{ height: '100%', width: '100%', zIndex: 1 }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution="&copy; OpenStreetMap contributors"
                                            />
                                            <LocationSelector 
                                                lat={data.office_lat} 
                                                lng={data.office_lon} 
                                                radius={data.office_radius} 
                                                onChange={(lat, lng) => {
                                                    setData({ 
                                                        ...data, 
                                                        office_lat: lat.toFixed(6), 
                                                        office_lon: lng.toFixed(6) 
                                                    });
                                                }} 
                                            />
                                        </MapContainer>
                                    </MapErrorBoundary>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Office Latitude</label>
                                        <input 
                                            type="text" 
                                            value={data.office_lat}
                                            onChange={e => setData('office_lat', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
                                            placeholder="-6.200000"
                                        />
                                        {errors.office_lat && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.office_lat}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Office Longitude</label>
                                        <input 
                                            type="text" 
                                            value={data.office_lon}
                                            onChange={e => setData('office_lon', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
                                            placeholder="106.816666"
                                        />
                                        {errors.office_lon && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.office_lon}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Max. Radius Tolerance (Meter)</label>
                                        <input 
                                            type="number" min="0" step="1"
                                            value={data.office_radius}
                                            onChange={e => setData('office_radius', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
                                        />
                                        {errors.office_radius && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.office_radius}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-8 py-4 rounded-xl font-black text-xs uppercase bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
