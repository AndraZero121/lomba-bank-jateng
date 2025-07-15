import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';

export default function SimpleLanding() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const islamicQuotes = [
    {
      text: "Sesungguhnya Allah menyukai orang-orang yang bertawakal kepada-Nya.",
      source: "QS. Ali Imran: 159",
    },
    {
      text: "Dan barangsiapa yang bertakwa kepada Allah niscaya Dia akan mengadakan baginya jalan keluar.",
      source: "QS. At-Talaq: 2",
    },
    {
      text: "Sesungguhnya sesudah kesulitan itu ada kemudahan.",
      source: "QS. Ash-Sharh: 6",
    },
    {
      text: "Dan Allah mencintai orang-orang yang berbuat kebaikan.",
      source: "QS. Al-Baqarah: 195",
    },
  ];

  // Move images array to useMemo
  const images = useMemo(() => [
    '/salatrps.jpeg', // Reorder working images first
    '/bertawakkal.jpeg',
    '/bungkus.jpg', // Use fallback for failed images
    '/bagitakjil.jpg'
  ], []);

  const [failedImages] = useState(new Set()); // Track failed images

  useEffect(() => {
    const resetStates = () => {
      setImageLoaded(false);
      setImageError(false);
    };

    const preloadImages = () => {
      resetStates();
      images.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (index === currentImage && !failedImages.has(index)) {
            setImageLoaded(true);
          }
        };
        img.onerror = () => {
          failedImages.add(index);
          if (index === currentImage) {
            // Use next working image as fallback
            const fallbackIndex = (index + 1) % images.length;
            setCurrentImage(fallbackIndex);
          }
        };
      });
    };

    preloadImages();
    setIsVisible(true);

    const intervals = [
      setInterval(() => setCurrentQuote(prev => (prev + 1) % islamicQuotes.length), 5000),
      setInterval(() => {
        let nextImage = (currentImage + 1) % images.length;
        // Skip failed images
        while (failedImages.has(nextImage)) {
          nextImage = (nextImage + 1) % images.length;
        }
        setCurrentImage(nextImage);
        resetStates();
      }, 5000)
    ];

    return () => intervals.forEach(clearInterval);
  }, [currentImage, failedImages, images, islamicQuotes.length]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  // Effect for audio autoplay
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.log("Autoplay was prevented:", error);
            setIsPlaying(false);
          });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column position-relative overflow-hidden"
         style={{
           background: 'linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)',
           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M0 0h20L0 20z\'/%3E%3C/g%3E%3C/svg%3E")'
         }}>
      {/* Background Ornamen SVG */}
      <svg
        className="position-absolute"
        style={{top: 0, left: 0, zIndex: 0}}
        width="220"
        height="220"
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="110" cy="110" r="100" fill="#ffe082" fillOpacity="0.18"/>
        <path d="M110 10 L130 60 L180 60 L140 90 L160 140 L110 110 L60 140 L80 90 L40 60 L90 60 Z" fill="#ffd54f" fillOpacity="0.25"/>
      </svg>
      <svg
        className="position-absolute"
        style={{bottom: 0, right: 0, zIndex: 0}}
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="90" cy="90" rx="80" ry="70" fill="#b2dfdb" fillOpacity="0.13"/>
        <path d="M90 30 L110 70 L150 70 L120 100 L135 140 L90 115 L45 140 L60 100 L30 70 L70 70 Z" fill="#4dd0e1" fillOpacity="0.18"/>
      </svg>
      {/* Animasi Bintang */}
      <div className="islamic-stars">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`star star-${i+1}`}></span>
        ))}
      </div>
      
      <Header />
      
      {/* Audio Element */}
      <audio ref={audioRef} loop>
        <source src="/sound/Yasin.mp3" type="audio/mpeg" />
      </audio>

      {/* Audio Control Button */}
      <button
        onClick={toggleAudio}
        className="btn position-fixed d-flex align-items-center gap-2"
        style={{
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '50px',
          padding: '0.75rem 1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        <i className={`bi ${isPlaying ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'}`} 
           style={{ fontSize: '1.5rem', color: '#198754' }}></i>
        <span style={{ color: '#198754', fontWeight: 500 }}>
          {isPlaying ? 'Pause Yasin' : 'Play Yasin'}
        </span>
      </button>
      
      <main className="flex-grow-1 d-flex align-items-center py-5" style={{position: 'relative', zIndex: 1}}>
        <div className="container">
          {/* Hero Section */}
          <div className="row align-items-center mb-5">
            <div className="col-lg-6 text-center text-lg-start">
              <div className={`mb-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                   style={{ transition: 'all 0.6s ease-out' }}>
                <p className="h3 text-dark fw-semibold mb-2" 
                   style={{fontFamily: 'Amiri, serif', fontSize: '2.5rem'}}>
                  بسم الله الرحمن الرحيم
                </p>
                <p className="text-dark">Bismillahirrahmanirrahim</p>
              </div>
              
              <div className={`mb-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                   style={{ transition: 'all 0.6s ease-out', transitionDelay: '0.2s' }}>
                <h1 className="display-4 fw-bold mb-4" style={{color: '#2c3e50'}}>
                  Selamat Datang
                </h1>
                <p className="lead text-muted" style={{fontSize: '1.25rem'}}>
                  Sistem manajemen karyawan yang profesional dengan landasan syariah Islam
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className={`${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                   style={{ transition: 'all 0.6s ease-out', transitionDelay: '0.4s' }}>
                <div className="bg-white rounded-lg shadow-lg p-5 mb-4 position-relative overflow-hidden">
                  <div className="position-absolute top-0 end-0 mt-3 me-3">
                    <i className="bi bi-quote text-warning" style={{fontSize: '2rem'}}></i>
                  </div>
                  {/* Simplified slideshow component */}
                  <div className="mb-3 text-center position-relative" style={{ height: 180 }}>
                    <img
                      key={currentImage}
                      src={images[currentImage]}
                      alt={`Slideshow ${currentImage + 1}`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{
                        width: '100%',
                        maxWidth: 320,
                        height: 180,
                        objectFit: 'cover',
                        borderRadius: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        opacity: imageLoaded ? 1 : 0,
                        transition: 'all 0.5s ease-in-out'
                      }}
                    />
                    {!imageLoaded && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ transition: 'all 0.5s ease-out' }}>
                    <p className="fst-italic mb-3 lead text-dark">
                      "{islamicQuotes[currentQuote].text}"
                    </p>
                    <p className="text-dark fw-semibold mb-0">
                      — {islamicQuotes[currentQuote].source}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="row g-4 mb-5">
            { [
              {
                img: '/salat.jpg',
                title: 'Adil & Transparan',
                desc: 'Pengelolaan data karyawan yang adil sesuai prinsip syariah'
              },
              {
                img: '/salam.jpg',
                title: 'Amanah & Terpercaya',
                desc: 'Sistem yang menjaga amanah informasi dengan penuh tanggung jawab'
              },
              {
                img: '/tahun.jpg',
                title: 'Berkah & Barakah',
                desc: 'Mengharapkan ridho Allah SWT dalam setiap aktivitas'
              }
            ].map((feature, index) => (
              <div className="col-md-4" key={index}>
                <div className="bg-white rounded-lg shadow-sm h-100 hover-lift feature-card"
                     style={{ 
                       transition: 'all 0.3s ease',
                       transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                       opacity: isVisible ? 1 : 0,
                       transitionDelay: `${0.6 + (index * 0.2)}s`
                     }}>
                  <div className="position-relative mb-4 feature-image-container">
                    <img
                      src={feature.img}
                      alt={feature.title}
                      className="w-100 feature-image"
                      style={{
                        height: '200px',
                        objectFit: 'cover',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px'
                      }}
                    />
                    <div className="feature-overlay">
                      <div className="feature-icon-container">
                        <img
                          src={feature.img}
                          alt={feature.title}
                          className="feature-icon"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <h3 className="h4 fw-bold mb-3 text-primary">{feature.title}</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '1rem', lineHeight: '1.6' }}>{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <div className="text-center">
            <button
              onClick={handleLoginClick}
              className="btn btn-primary btn-lg px-5 py-3 fw-semibold rounded-pill hover-lift"
              style={{
                transition: 'all 0.3s ease',
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0,
                transitionDelay: '1.2s',
                boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
              }}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Masuk ke Sistem
            </button>
          </div>
        </div>
      </main>


      {/* Enhanced Footer */}
      <footer className="bg-white border-top py-4 position-relative">
        <div className="container text-center">
          <p className="text-muted mb-1">
            &copy; 2025 <span className="text-primary fw-semibold">Bank Jateng Syariah</span>
          </p>
          <p className="small text-muted">
            Developed with <i className="bi bi-heart-fill text-danger mx-1"></i> by <span className="text-primary">Sipena Dev</span>
          </p>
        </div>
      </footer>

      <style jsx>{`
        .hover-lift {
          transition: all 0.3s ease-out;
          overflow: hidden;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .translate-y-0 {
          transform: translateY(0);
        }
        .translate-y-4 {
          transform: translateY(1rem);
        }
        .scale-100 {
          transform: scale(1);
        }
        .scale-95 {
          transform: scale(0.95);
        }
        .feature-card {
          border: none;
          background: white;
          overflow: hidden;
        }
        .feature-image-container {
          position: relative;
          overflow: hidden;
        }
        .feature-image {
          transition: transform 0.5s ease;
        }
        .feature-card:hover .feature-image {
          transform: scale(1.05);
        }
        .feature-overlay {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .feature-icon-container {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          padding: 2px;
        }
        .feature-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }
        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }
        @media (max-width: 768px) {
          .feature-image {
            height: 180px !important;
          }
        }
        @media (max-width: 576px) {
          .feature-image {
            height: 160px !important;
          }
        }
        /* Animasi bintang islami */
        .islamic-stars {
          pointer-events: none;
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: 1;
        }
        .star {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #ffd600;
          border-radius: 50%;
          opacity: 0.7;
          animation: star-float 7s linear infinite;
        }
        .star-1 { left: 10vw; top: 80vh; animation-delay: 0s;}
        .star-2 { left: 20vw; top: 85vh; animation-delay: 1s;}
        .star-3 { left: 30vw; top: 90vh; animation-delay: 2s;}
        .star-4 { left: 40vw; top: 75vh; animation-delay: 3s;}
        .star-5 { left: 50vw; top: 88vh; animation-delay: 4s;}
        .star-6 { left: 60vw; top: 92vh; animation-delay: 2.5s;}
        .star-7 { left: 70vw; top: 86vh; animation-delay: 1.5s;}
        .star-8 { left: 80vw; top: 93vh; animation-delay: 3.5s;}
        .star-9 { left: 90vw; top: 89vh; animation-delay: 5s;}
        .star-10 { left: 15vw; top: 95vh; animation-delay: 4.5s;}
        .star-11 { left: 65vw; top: 97vh; animation-delay: 6s;}
        .star-12 { left: 85vw; top: 98vh; animation-delay: 5.5s;}
        @keyframes star-float {
          0% { transform: translateY(0) scale(1);}
          80% { opacity: 0.7;}
          100% { transform: translateY(-80vh) scale(1.2); opacity: 0;}
        }
      `}</style>
    </div>
  );
}