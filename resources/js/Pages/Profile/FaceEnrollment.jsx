import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Transition } from '@headlessui/react';

export default function FaceEnrollment({ auth }) {
    const videoRef = useRef();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Initializing camera...');
    const [progress, setProgress] = useState(0);
    const [faceDetected, setFaceDetected] = useState(false);
    const [enrolled, setEnrolled] = useState(auth.user.face_enrolled);
    const [isCapturing, setIsCapturing] = useState(false);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        embedding: [],
    });

    useEffect(() => {
        const loadModels = async () => {
            try {
                setStatus('Loading AI models...');
                const MODEL_URL = '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                
                setStatus('Models loaded. Accessing camera...');
                startVideo();
            } catch (err) {
                console.error(err);
                setStatus('Error loading models: ' + err.message);
            }
        };

        const startVideo = () => {
            navigator.mediaDevices.getUserMedia({ video: {} })
                .then(stream => {
                    videoRef.current.srcObject = stream;
                    setLoading(false);
                    setStatus('Ready for scan');
                })
                .catch(err => {
                    console.error(err);
                    setStatus('Camera access denied');
                });
        };

        loadModels();
    }, []);

    useEffect(() => {
        let interval;
        if (!loading && videoRef.current) {
            interval = setInterval(async () => {
                if (videoRef.current) {
                    const detections = await faceapi.detectSingleFace(
                        videoRef.current, 
                        new faceapi.TinyFaceDetectorOptions()
                    ).withFaceLandmarks().withFaceDescriptor();

                    if (detections) {
                        setFaceDetected(true);
                        if (!isCapturing && !enrolled) {
                            // Extract embedding
                            setData('embedding', Array.from(detections.descriptor));
                        }
                    } else {
                        setFaceDetected(false);
                    }
                }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [loading, isCapturing, enrolled]);

    const submit = (e) => {
        e.preventDefault();
        setIsCapturing(true);
        post(route('face.enrollment.update'), {
            onSuccess: () => {
                setEnrolled(true);
                setIsCapturing(false);
            },
            onError: () => setIsCapturing(false)
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Face Enrollment</h2>}
        >
            <Head title="Face Enrollment" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-2xl sm:rounded-2xl border border-gray-100">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-10 items-center">
                                {/* Left Side: Camera */}
                                <div className="relative w-full md:w-1/2 aspect-square bg-gray-900 rounded-3xl overflow-hidden border-4 border-indigo-500/20 shadow-inner group">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        className="w-full h-full object-cover transform -scale-x-100"
                                    />
                                    
                                    {/* Overlays */}
                                    <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40" style={{ borderRadius: '50%' }}></div>
                                    
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 mb-4"></div>
                                                <p className="text-white text-sm font-medium">{status}</p>
                                            </div>
                                        </div>
                                    )}

                                    {!loading && faceDetected && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100"></span>
                                            </span>
                                            Face Detected
                                        </div>
                                    )}

                                    {!loading && !faceDetected && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">
                                            No Face Detected
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Info & Controls */}
                                <div className="w-full md:w-1/2 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                                            {enrolled ? 'Wajah Anda Sudah Terdaftar' : 'Daftarkan Wajah Anda'}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            {enrolled 
                                                ? 'Sistem sudah memiliki data biometrik Anda. Anda bisa langsung melakukan absensi mulai sekarang.'
                                                : 'Pastikan pencahayaan cukup dan wajah terlihat jelas di layar. Jangan gunakan masker atau kacamata gelap.'}
                                        </p>
                                    </div>

                                    {enrolled ? (
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                                            <div className="p-2 bg-indigo-500 rounded-xl text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 14.535a12.003 12.003 0 0019 0l-1.382-8.591z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-indigo-900 uppercase">Tingkat Keamanan</h4>
                                                <p className="text-indigo-700 text-xs">Biometrik terenkripsi (AES-256)</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <form onSubmit={submit} className="space-y-4">
                                                {errors.embedding && (
                                                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold text-center">
                                                        ⚠️ {errors.embedding}
                                                    </div>
                                                )}
                                                <button
                                                    disabled={!faceDetected || isCapturing}
                                                    className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 ${
                                                        !faceDetected || isCapturing 
                                                        ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                                                    }`}
                                                >
                                                    {isCapturing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                                            Enrolling...
                                                        </>
                                                    ) : (
                                                        'Daftar Sekarang'
                                                    )}
                                                </button>
                                            </form>
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-400 font-medium bg-gray-50 py-2 rounded-lg">
                                                    🔒 PRIVASI ANDA TERJAGA. DATA DIAMANKAN
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {recentlySuccessful && (
                                        <Transition
                                            show={recentlySuccessful}
                                            as="div"
                                            enter="transition ease-out duration-300"
                                            enterFrom="opacity-0 translate-y-2"
                                            enterTo="opacity-100 translate-y-0"
                                            className="bg-green-100 text-green-800 p-4 rounded-2xl text-sm font-bold text-center"
                                        >
                                            Pendaftaran Berhasil! 🎉
                                        </Transition>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
