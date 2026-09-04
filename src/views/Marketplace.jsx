import { useState, useEffect } from 'react';
import { Star, Book, Lightbulb, Rocket, Droplet, ArrowLeft, History, ShoppingBag, MapPin, CreditCard, ChevronRight, Check } from 'lucide-react';
import { mockDb } from '../lib/mockDb';
import CustomModal from '../components/CustomModal';

const countryCodes = [
  { code: '+60', name: 'Malaysia 🇲🇾' },
  { code: '+65', name: 'Singapore 🇸🇬' },
  { code: '+62', name: 'Indonesia 🇮🇩' },
  { code: '+673', name: 'Brunei 🇧🇳' },
  { code: '+852', name: 'Hong Kong 🇭🇰' },
];

const renderProductIcon = (iconType, size = 48) => {
  const props = { size, color: "var(--text-primary)", strokeWidth: 1.5 };
  switch (iconType) {
    case 'book': return <Book {...props} />;
    case 'lamp': return <Lightbulb {...props} />;
    case 'rocket': return <Rocket {...props} />;
    case 'droplet': return <Droplet {...props} />;
    default: return <ShoppingBag {...props} />;
  }
};

const Marketplace = ({ userBP, currentUser, onRegister, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('bp'); // 'bp' or 'cash'
  const [view, setView] = useState('list'); // 'list', 'details', 'checkout', 'success', 'history'
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [successOrder, setSuccessOrder] = useState(null);

  // Shipping Form State
  const [shippingName, setShippingName] = useState('');
  const [shippingWhatsapp, setShippingWhatsapp] = useState('');
  const [countryCode, setCountryCode] = useState('+60');
  const [shippingAddress1, setShippingAddress1] = useState('');
  const [shippingAddress2, setShippingAddress2] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingCountry, setShippingCountry] = useState('Malaysia');
  
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom Modal for Guest Prompts
  const [guestModal, setGuestModal] = useState({ isOpen: false, title: '', message: '' });

  // Initial load
  useEffect(() => {
    setProducts(mockDb.getProducts());
  }, [view]);

  // Handle auto fill on checkout screen if user logged in
  useEffect(() => {
    if (currentUser && view === 'checkout') {
      setShippingName(currentUser.email.split('@')[0] || '');
      
      const wa = currentUser.whatsapp || '';
      let foundCode = false;
      for (const item of countryCodes) {
        if (wa.startsWith(item.code)) {
          setCountryCode(item.code);
          setShippingWhatsapp(wa.replace(item.code, ''));
          foundCode = true;
          break;
        }
      }
      if (!foundCode) {
        if (wa.startsWith('0')) {
          setCountryCode('+60');
          setShippingWhatsapp(wa.substring(1));
        } else {
          setCountryCode('+60');
          setShippingWhatsapp(wa);
        }
      }
    }
  }, [currentUser, view]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setView('details');
  };

  const handleGoToHistory = () => {
    if (!currentUser) {
      setGuestModal({
        isOpen: true,
        title: 'Guest Mode',
        message: 'You are currently in Guest mode. Please register an account to view redemption and purchase history!'
      });
      return;
    }
    const userOrders = mockDb.getUserOrders(currentUser.id);
    setOrders(userOrders);
    setView('history');
  };

  const handleActionButton = () => {
    if (!currentUser) {
      setGuestModal({
        isOpen: true,
        title: 'Guest Mode',
        message: 'You are currently in Guest mode. Please register to save your BP and fill in shipping details. Register now?'
      });
      return;
    }

    if (activeTab === 'bp' && currentUser.total_bp < selectedProduct.bp_price) {
      return; // Insufficient BP
    }

    setView('checkout');
    setErrorMsg('');
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!shippingName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!shippingWhatsapp.trim()) {
      setErrorMsg('Please enter your WhatsApp number');
      return;
    }
    if (!shippingAddress1.trim() || !shippingZip.trim() || !shippingCity.trim() || !shippingState.trim()) {
      setErrorMsg('Please complete all required address fields (Address 1, ZIP, City, State)');
      return;
    }

    setErrorMsg('');
    const fullWhatsappNumber = countryCode + shippingWhatsapp.replace(/\s+/g, '');
    
    // Assemble the full address
    let fullAddr = shippingAddress1.trim();
    if (shippingAddress2.trim()) fullAddr += `, ${shippingAddress2.trim()}`;
    fullAddr += `, ${shippingZip.trim()} ${shippingCity.trim()}, ${shippingState.trim()}, ${shippingCountry.trim()}`;

    const shippingDetails = {
      fullName: shippingName.trim(),
      whatsapp: fullWhatsappNumber,
      address: fullAddr,
      email: currentUser ? currentUser.email : 'guest@playbank.com'
    };

    const result = mockDb.createOrder(
      currentUser ? currentUser.id : null,
      selectedProduct.id,
      activeTab,
      shippingDetails
    );

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      if (result.updatedUser && onUserUpdate) {
        onUserUpdate(result.updatedUser);
      }
      setSuccessOrder(result.order);
      setView('success');
    }
  };

  const renderListView = () => {
    const filteredProducts = products;

    return (
      <div className="view-content" style={{ padding: '24px 20px 140px 20px' }}>
        {/* Header */}
        <header className="flex-between" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="text-h2" style={{ fontWeight: 800 }}>Shop & Redeem</h1>
            <p className="text-small" style={{ marginTop: '2px' }}>Use your BP or get special cash offers</p>
          </div>
          <button 
            onClick={handleGoToHistory}
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'transform 0.2s ease'
            }}
            title="My Orders"
          >
            <History size={20} />
          </button>
        </header>

        {/* User BP Status Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-primary) 0%, #FFA800 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          color: '#000000',
          marginBottom: '24px',
          boxShadow: '0 8px 30px rgba(255, 188, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {currentUser ? 'Your Accumulated Balance' : 'Guest BP (Temporary)'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <Star size={28} fill="#000" color="#000" />
              <span style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {userBP?.toLocaleString() || '0'}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, opacity: 0.9, alignSelf: 'flex-end', marginBottom: '4px' }}>BP</span>
            </div>
          </div>
          {!currentUser && (
            <button 
              onClick={onRegister}
              style={{
                background: '#000000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: 'var(--card-shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              Register Now
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button 
            onClick={() => setActiveTab('bp')}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'bp' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'bp' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'bp' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeTab === 'bp' ? 'var(--card-shadow-sm)' : 'none',
              fontSize: '14px'
            }}
          >
            Redeem with BP
          </button>
          <button 
            onClick={() => setActiveTab('cash')}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'cash' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'cash' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'cash' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeTab === 'cash' ? 'var(--card-shadow-sm)' : 'none',
              fontSize: '14px'
            }}
          >
            Offer (Cash)
          </button>
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            return (
              <div 
                key={product.id} 
                onClick={() => !isOutOfStock && handleSelectProduct(product)}
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--card-shadow-sm)',
                  border: '1px solid var(--border-color)',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease'
                }}
                className="product-card"
              >
                {isOutOfStock && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--error)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    zIndex: 2
                  }}>
                    Out of Stock
                  </div>
                )}
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
                }}>
                  {renderProductIcon(product.icon_type, 56)}
                </div>
                <h3 className="text-body-bold" style={{ marginBottom: '8px', fontSize: '15px', lineHeight: 1.2, flex: 1 }}>{product.name}</h3>
                
                <div className="flex-between" style={{ marginTop: 'auto', width: '100%' }}>
                  {activeTab === 'bp' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={16} fill="var(--brand-primary)" color="var(--brand-primary)" />
                      <span className="text-body-bold" style={{ fontSize: '15px' }}>{product.bp_price.toLocaleString()} BP</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="text-body-bold" style={{ color: 'var(--success)', fontSize: '16px' }}>RM {product.cash_price}</span>
                    </div>
                  )}
                  <span className="text-small" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Stock: {product.stock}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDetailsView = () => {
    if (!selectedProduct) return null;
    const isOutOfStock = selectedProduct.stock <= 0;
    const isBPMode = activeTab === 'bp';
    const isInsufficientBP = isBPMode && currentUser && currentUser.total_bp < selectedProduct.bp_price;

    return (
      <div className="view-content" style={{ padding: '0 0 140px 0', position: 'relative' }}>
        {/* Navigation Bar */}
        <header style={{
          padding: '20px 20px 10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'transparent',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <button 
            onClick={() => setView('list')}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--card-shadow-sm)',
              color: 'var(--text-primary)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-h4" style={{ fontWeight: 700 }}>Product Details</span>
        </header>

        {/* Product Visual Area */}
        <div style={{
          width: '100%',
          height: '240px',
          background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '150px',
            height: '150px',
            background: 'var(--card-bg)',
            borderRadius: '40px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-10px)'
          }}>
            {renderProductIcon(selectedProduct.icon_type, 80)}
          </div>
        </div>

        {/* Main Info Block */}
        <div style={{ padding: '0 24px' }}>
          <h2 className="text-h2" style={{ fontWeight: 800, marginBottom: '8px' }}>{selectedProduct.name}</h2>
          
          <div className="flex-between" style={{ marginBottom: '24px' }}>
            {isBPMode ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '15px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                    RM {selectedProduct.cash_price}
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-primary-hover)' }}>
                    RM 0
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--brand-soft)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  marginTop: '8px',
                  border: '1px solid var(--brand-primary)'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#000', letterSpacing: '0.5px' }}>{selectedProduct.bp_price.toLocaleString()} BP</span>
                </div>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-primary-hover)' }}>
                  RM {selectedProduct.cash_price}
                </span>
                <span className="text-small" style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Direct Cash Purchase
                </span>
              </div>
            )}
            
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: selectedProduct.stock > 3 ? 'rgba(255, 188, 0, 0.15)' : 'rgba(231, 76, 60, 0.1)',
                color: selectedProduct.stock > 3 ? 'var(--brand-primary-hover)' : 'var(--error)',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                {selectedProduct.stock > 3 ? `In Stock (${selectedProduct.stock})` : `Only ${selectedProduct.stock} Left`}
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          {/* Description Block */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="text-h4" style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Description</h3>
            <p className="text-body" style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              {selectedProduct.description || 'No description available.'}
            </p>
          </div>

          {/* Terms & Conditions Block */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <h3 className="text-h4" style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>Terms & Conditions</h3>
            <ul style={{ paddingLeft: '18px', margin: 0, listStyleType: 'disc' }}>
              {(selectedProduct.tnc || '').split('\n').filter(Boolean).map((line, idx) => (
                <li key={idx} className="text-small" style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '4px' }}>
                  {line.substring(2)} {/* remove number list e.g. "1. " */}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Floating Bar */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          background: 'var(--card-bg)',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 24px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          zIndex: 999
        }}>
          {/* Left Side: Price Value */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-small" style={{ color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 600 }}>Total Price</span>
            {isBPMode ? (
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-primary-hover)', lineHeight: 1 }}>{selectedProduct.bp_price.toLocaleString()} BP</span>
            ) : (
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-primary-hover)', lineHeight: 1 }}>RM {selectedProduct.cash_price}</span>
            )}
          </div>

          {/* Right Side: Action Button */}
          <button 
            disabled={isInsufficientBP || isOutOfStock}
            onClick={handleActionButton}
            style={{
              flex: 1,
              maxWidth: '200px',
              padding: '16px',
              borderRadius: '30px',
              border: 'none',
              background: (isInsufficientBP || isOutOfStock) ? 'var(--bg-tertiary)' : 'var(--brand-primary)',
              color: (isInsufficientBP || isOutOfStock) ? 'var(--text-secondary)' : '#000000',
              fontWeight: 700,
              fontSize: '15px',
              cursor: (isInsufficientBP || isOutOfStock) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: (isInsufficientBP || isOutOfStock) ? 'none' : '0 4px 12px rgba(255,188,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isOutOfStock ? (
              'Sold Out'
            ) : isBPMode ? (
              isInsufficientBP ? 'Insufficient BP' : 'Redeem Now'
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderCheckoutView = () => {
    if (!selectedProduct) return null;
    const isBPMode = activeTab === 'bp';
    
    // Fee Calculation
    const shippingFee = isBPMode ? 0 : 5; // Free for BP, RM 5 for Cash
    const totalCashPayment = selectedProduct.cash_price + shippingFee;

    return (
      <div className="view-content" style={{ padding: '0 0 160px 0', position: 'relative' }}>
        {/* Navigation */}
        <header style={{
          padding: '20px 20px 10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'transparent'
        }}>
          <button 
            onClick={() => setView('details')}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-h4" style={{ fontWeight: 700 }}>Checkout</span>
        </header>

        <form onSubmit={handlePlaceOrder} style={{ padding: '0 24px' }}>
          {/* Order Summary Card (Hero Section updated to Yellow) */}
          <div style={{
            background: 'var(--brand-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '24px',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 8px 24px rgba(255, 188, 0, 0.2)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--card-shadow-sm)'
            }}>
              {renderProductIcon(selectedProduct.icon_type, 36)}
            </div>
            <div style={{ flex: 1 }}>
              <span className="text-small" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                {isBPMode ? 'BP Redemption' : 'Cash Purchase'}
              </span>
              <h4 className="text-body-bold" style={{ fontSize: '15px', marginTop: '2px', color: '#000' }}>{selectedProduct.name}</h4>
              
              {isBPMode ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Star size={14} fill="#000" color="#000" />
                  <span className="text-small-bold" style={{ color: '#000' }}>{selectedProduct.bp_price.toLocaleString()} BP</span>
                  <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)', textDecoration: 'line-through', marginLeft: '6px' }}>
                    RM {selectedProduct.cash_price}
                  </span>
                  <span style={{ fontSize: '12px', color: '#000', fontWeight: 'bold' }}>
                    (RM 0)
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span className="text-small-bold" style={{ color: '#000', fontSize: '16px' }}>RM {selectedProduct.cash_price}</span>
                </div>
              )}
            </div>
          </div>

          {/* User Points Check (For BP Mode) */}
          {isBPMode && currentUser && (
            <div style={{
              background: 'rgba(255, 188, 0, 0.06)',
              border: '1px dashed var(--brand-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span className="text-small">Current Points:</span>
                <span className="text-small-bold">{currentUser.total_bp.toLocaleString()} BP</span>
              </div>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span className="text-small">Deduct:</span>
                <span className="text-small-bold" style={{ color: 'var(--error)' }}>- {selectedProduct.bp_price.toLocaleString()} BP</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
              <div className="flex-between">
                <span className="text-small" style={{ fontWeight: 600 }}>Remaining Balance:</span>
                <span className="text-small-bold" style={{ color: 'var(--brand-primary-hover)' }}>{(currentUser.total_bp - selectedProduct.bp_price).toLocaleString()} BP</span>
              </div>
            </div>
          )}

          {/* Shipping Form Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MapPin size={18} color="var(--brand-primary)" />
            <h3 className="text-h4">Shipping Details</h3>
          </div>

          {/* Error Prompt */}
          {errorMsg && (
            <div style={{
              background: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>Full Name *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. John Doe"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              required
            />
          </div>

          {/* WhatsApp Number */}
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>WhatsApp Number *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                style={{
                  padding: '16px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                {countryCode} ▾
              </button>
              
              <input 
                type="tel" 
                className="input-field" 
                placeholder="123456789"
                value={shippingWhatsapp}
                onChange={(e) => setShippingWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                required
                style={{ flex: 1 }}
              />
            </div>

            {/* Country Selector Dropdown */}
            {showCountrySelector && (
              <div style={{
                position: 'absolute',
                top: '80px',
                left: 0,
                zIndex: 20,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--card-shadow)',
                width: '180px',
                overflow: 'hidden'
              }}>
                {countryCodes.map((item) => (
                  <div 
                    key={item.code}
                    onClick={() => {
                      setCountryCode(item.code);
                      setShowCountrySelector(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      background: countryCode === item.code ? 'var(--bg-secondary)' : 'transparent',
                      transition: 'background 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{item.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          {/* Detailed Address Fields */}
          <div style={{ marginBottom: '16px' }}>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>Address 1 *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="House/Unit No, Building Name, Street"
              value={shippingAddress1}
              onChange={(e) => setShippingAddress1(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>Address 2 (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Apartment, suite, etc."
              value={shippingAddress2}
              onChange={(e) => setShippingAddress2(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>ZIP Code *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. 50450"
                value={shippingZip}
                onChange={(e) => setShippingZip(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>City *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Kuala Lumpur"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div style={{ flex: 1 }}>
              <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>State *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Selangor"
                value={shippingState}
                onChange={(e) => setShippingState(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-small-bold" style={{ display: 'block', marginBottom: '8px' }}>Country</label>
              <input 
                type="text" 
                className="input-field" 
                value={shippingCountry}
                readOnly
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-md)', 
            padding: '16px', 
            marginBottom: '40px' 
          }}>
            <h4 className="text-small-bold" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Payment Summary</h4>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <span className="text-small">Subtotal</span>
              <span className="text-small-bold">
                {isBPMode ? `${selectedProduct.bp_price.toLocaleString()} BP` : `RM ${selectedProduct.cash_price.toFixed(2)}`}
              </span>
            </div>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <span className="text-small">Shipping Fee</span>
              <span className="text-small-bold">
                {shippingFee === 0 ? 'Free' : `RM ${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
            <div className="flex-between">
              <span className="text-body-bold">Total Payment</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-primary-hover)' }}>
                {isBPMode ? `${selectedProduct.bp_price.toLocaleString()} BP` : `RM ${totalCashPayment.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Sticky Checkout Bar */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            background: 'var(--card-bg)',
            borderTop: '1px solid var(--border-color)',
            padding: '16px 24px',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            zIndex: 999
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-small" style={{ color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 600 }}>Total Payment</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-primary-hover)', lineHeight: 1 }}>
                {isBPMode ? `${selectedProduct.bp_price.toLocaleString()} BP` : `RM ${totalCashPayment.toFixed(2)}`}
              </span>
            </div>
            
            <button 
              type="submit"
              style={{
                flex: 1,
                maxWidth: '220px',
                padding: '16px',
                borderRadius: '30px',
                border: 'none',
                background: 'var(--brand-primary)',
                color: '#000000',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(255,188,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={18} />
              {isBPMode ? 'Confirm Redeem' : 'Place Order & Pay'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderSuccessView = () => {
    if (!successOrder) return null;
    const isBPMode = successOrder.type === 'bp';

    return (
      <div className="view-content flex-column" style={{ padding: '40px 24px', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Sprinkles & Spring Success Icon */}
        <div 
          className="modal-spring"
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand-primary) 0%, #FFA800 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(255, 188, 0, 0.3)',
            marginBottom: '28px'
          }}
        >
          <Check size={48} color="#000" strokeWidth={3} />
        </div>

        <h2 className="text-h2" style={{ fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
          {isBPMode ? 'Redemption Successful!' : 'Order Placed!'}
        </h2>
        <p className="text-body" style={{ textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          {isBPMode 
            ? `Your order for ${successOrder.productName} has been processed. We have deducted ${successOrder.price.toLocaleString()} BP from your account.`
            : `Your purchase for ${successOrder.productName} is complete. Your order is now being processed!`
          }
        </p>

        {/* Order Card Detail Info */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          width: '100%',
          border: '1px solid var(--border-color)',
          marginBottom: '40px'
        }}>
          <h4 className="text-small-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Order Summary
          </h4>
          
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span className="text-small">Order ID:</span>
            <span className="text-small-bold" style={{ color: 'var(--text-primary)' }}>{successOrder.id}</span>
          </div>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span className="text-small">Recipient:</span>
            <span className="text-small-bold" style={{ color: 'var(--text-primary)' }}>{successOrder.shippingDetails?.fullName}</span>
          </div>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span className="text-small">WhatsApp:</span>
            <span className="text-small-bold" style={{ color: 'var(--text-primary)' }}>{successOrder.shippingDetails?.whatsapp}</span>
          </div>
          <div className="flex-between" style={{ marginBottom: '8px', alignItems: 'flex-start' }}>
            <span className="text-small" style={{ marginTop: '2px' }}>Address:</span>
            <span className="text-small-bold" style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '180px', wordBreak: 'break-word', lineHeight: 1.4 }}>
              {successOrder.shippingDetails?.address}
            </span>
          </div>
        </div>

        <button 
          onClick={() => {
            setView('list');
            setSelectedProduct(null);
            setSuccessOrder(null);
            setErrorMsg('');
          }}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '30px',
            border: 'none',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--card-shadow-sm)'
          }}
        >
          Back to Shop
        </button>
      </div>
    );
  };

  const renderHistoryView = () => {
    return (
      <div className="view-content" style={{ padding: '24px 20px 100px 20px' }}>
        {/* Navigation Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'transparent',
          marginBottom: '24px'
        }}>
          <button 
            onClick={() => setView('list')}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-h3" style={{ fontWeight: 800 }}>My Orders</span>
        </header>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="flex-column flex-center" style={{ padding: '80px 20px', gap: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <ShoppingBag size={36} strokeWidth={1.5} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 className="text-body-bold" style={{ marginBottom: '4px' }}>No Orders Found</h4>
              <p className="text-small" style={{ maxWidth: '240px', margin: '0 auto', lineHeight: 1.4 }}>
                You haven't made any redemptions or purchases yet. Earn more BP by playing challenges!
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => {
              const isBP = order.type === 'bp';
              return (
                <div 
                  key={order.id}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    boxShadow: 'var(--card-shadow-sm)'
                  }}
                >
                  {/* Order Card Header */}
                  <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
                    <div>
                      <span className="text-small-bold" style={{ color: 'var(--text-primary)' }}>{order.id}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span style={{
                      background: 'rgba(255, 188, 0, 0.15)',
                      color: 'var(--brand-primary-hover)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '10px'
                    }}>
                      Processed
                    </span>
                  </div>

                  {/* Order Product Info */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {renderProductIcon(
                        order.productName.toLowerCase().includes('notebook') ? 'book' :
                        order.productName.toLowerCase().includes('lamp') ? 'lamp' :
                        order.productName.toLowerCase().includes('booster') ? 'rocket' : 'droplet',
                        24
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 className="text-body-bold" style={{ fontSize: '14px' }}>{order.productName}</h4>
                      <p className="text-small" style={{ fontSize: '12px', marginTop: '2px' }}>
                        Type: {isBP ? 'BP Redemption' : 'Cash Purchase'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {isBP ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <Star size={12} fill="var(--brand-primary)" color="var(--brand-primary)" />
                          <span className="text-small-bold" style={{ color: 'var(--text-primary)' }}>-{order.price} BP</span>
                        </div>
                      ) : (
                        <span className="text-small-bold" style={{ color: 'var(--brand-primary-hover)' }}>RM {order.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Recipient Details Accordion Look */}
                  <div style={{
                    marginTop: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    fontSize: '11px'
                  }}>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>Ship to:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {order.shippingDetails?.fullName} ({order.shippingDetails?.whatsapp})
                    </span>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-word' }}>
                      {order.shippingDetails?.address}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Internal routing switch
  const renderCurrentView = () => {
    const FullScreenOverlay = ({ children }) => (
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100dvh', background: 'var(--bg-app)', zIndex: 9999, overflowY: 'auto' }}>
        {children}
      </div>
    );

    switch (view) {
      case 'details':
        return <FullScreenOverlay>{renderDetailsView()}</FullScreenOverlay>;
      case 'checkout':
        return <FullScreenOverlay>{renderCheckoutView()}</FullScreenOverlay>;
      case 'success':
        return <FullScreenOverlay>{renderSuccessView()}</FullScreenOverlay>;
      case 'history':
        return <FullScreenOverlay>{renderHistoryView()}</FullScreenOverlay>;
      case 'list':
      default:
        return renderListView();
    }
  };

  return (
    <>
      {renderCurrentView()}
      
      <CustomModal 
        isOpen={guestModal.isOpen}
        onClose={() => setGuestModal({ ...guestModal, isOpen: false })}
        title={guestModal.title}
        message={guestModal.message}
        showCancel={true}
        confirmText="Register Now"
        onConfirm={() => {
          setGuestModal({ ...guestModal, isOpen: false });
          onRegister();
        }}
      />
    </>
  );
};

export default Marketplace;
