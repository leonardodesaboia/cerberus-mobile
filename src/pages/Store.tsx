import { IonPage, IonContent, IonCard, IonText, IonLabel, IonImg, IonAlert, IonCardHeader, IonCardSubtitle, IonCardTitle, IonToast, IonIcon } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Store.css';
import Toolbar from '../components/Toolbar';
import Header from '../components/Header';
import { updateUserPoints, fetchProducts, getUserData, redeemProduct } from '../services/api';
import PointsUpdateEvent from '../utils/pointsUpdateEvent';
import { useHistory } from 'react-router-dom'; // Import useHistory for redirection
import { timeOutline } from 'ionicons/icons';

interface Product {
    _id: string;
    name: string;
    price: number;
    img: string;
    isActive: boolean;
    stock: number;
}

interface Section {
    title: string;
    products: Product[];
}

const Store: React.FC = () => {
    const history = useHistory(); // Use history for navigation
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSections, setProductSections] = useState<Section[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [userPoints, setUserPoints] = useState<number>(0);
    const [shouldRefreshHeader, setShouldRefreshHeader] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    // Carregar dados do usuário
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await getUserData();
                setUserPoints(userData.points);
            } catch (err) {
                setError('Erro ao carregar dados do usuário');
                console.error('Erro ao carregar dados do usuário:', err);
            }
        };

        loadUserData();
    }, [shouldRefreshHeader]);

    // Carregar produtos
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const productsData = await fetchProducts();
                const activeProducts = productsData.filter((product: Product) => product.isActive);

                const sections: Section[] = [
                    {
                        title: 'Até 5000 pontos',
                        products: activeProducts.filter((p: Product) => p.price <= 5000)
                    },
                    {
                        title: 'De 5000 até 10000 pontos',
                        products: activeProducts.filter((p: Product) => p.price > 5000 && p.price <= 10000)
                    },
                    {
                        title: 'De 10000 até 20000 pontos',
                        products: activeProducts.filter((p: Product) => p.price > 10000 && p.price <= 20000)
                    },
                    {
                        title: 'Acima de 2000 pontos',
                        products: activeProducts.filter((p: Product) => p.price > 20000)
                    }
                ];

                setProductSections(sections.filter(section => section.products.length > 0));
            } catch (err) {
                setError('Erro ao carregar produtos');
                console.error('Erro ao carregar produtos:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    const handleProductClick = (product: Product) => {
        if (userPoints < product.price) {
            setToastMessage('Pontos insuficientes para esta troca');
            setShowToast(true);
            return;
        }
        setSelectedProduct(product);
        setShowAlert(true);
    };

      const renderEmptyState = () => (
        <div className="empty-statement-state">
          <IonIcon icon={timeOutline} className="empty-icon" />
          <h3>Nenhum produto encontrado</h3>
        </div>
      );

    const handlePurchaseConfirmation = async () => {
        if (!selectedProduct) return;
    
        const newPoints = userPoints - selectedProduct.price;
    
        if (newPoints < 0) {
            setToastMessage('Pontos insuficientes para esta troca');
            setShowToast(true);
            return;
        }
    
        try {
            setLoading(true);
            console.log("Iniciando processo de resgate do produto:", selectedProduct.name);
            
            // Use the simplified redeemProduct function
            await redeemProduct(selectedProduct);
            console.log("Produto resgatado com sucesso");
            
            // Update UI
            setUserPoints(newPoints);
            
            // IMPORTANT: Emit the points update event to notify other components
            PointsUpdateEvent.emit();
            
            setShowAlert(false);
            setSelectedProduct(null);
            setError(null);
            
            // Show success toast
            setToastMessage(`${selectedProduct.name} resgatado com sucesso!`);
            setShowToast(true);
            
            // Navigate to redeem page after brief delay
            setTimeout(() => {
                history.push('/redeem');
            }, 1500);
        } catch (err: any) {
            console.error('Erro ao processar a troca:', err);
            
            // Show specific error message from API or fallback to generic message
            const errorMessage = err.message || 'Erro desconhecido';
            setToastMessage(`Erro ao processar a troca: ${errorMessage}`);
            setShowToast(true);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
          <Header />
            <IonContent fullscreen>
                <div className="store-content">
                    <IonText className="title-text">
                        <h2 className="products-title">Troque seus pontos</h2>
                    </IonText>

                    {error && (
                        <div className="error-message">
                        {error}
                        <p style={{ color: 'red' , fontSize: '32px', fontWeight: 'bold'}}>Ocorreu um erro: ${error}</p>
                        </div>
                    )}

                    {loading ? (
                                <div className="loader">
                                <div className="spinner"></div>
                                </div>
                            ) : productSections.length === 0 ? (
                                renderEmptyState()
                            ) : (
                    productSections.map((section, index) => (
                        <div className="points-section" key={index}>
                            <IonLabel>
                                <h3>{section.title}</h3>
                            </IonLabel>
                            <Swiper
                                modules={[Pagination]}
                                spaceBetween={10}
                                slidesPerView={2.3}
                                className="products-swiper-store"
                            >
                                {section.products.map((product) => (
                                    <SwiperSlide key={product._id} className='swiper-slide-redeem-store'>
                                        <IonCard 
                                            className="product-card"
                                            onClick={() => handleProductClick(product)}
                                        >
                                            <img src={product.img} alt={product.name} className="product-image" />
                                            <IonCardHeader>
                                                <IonCardTitle className="product-name">{product.name}</IonCardTitle>
                                                <IonCardSubtitle className="product-points">{product.price} pontos</IonCardSubtitle>
                                            </IonCardHeader>
                                        </IonCard>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    )))}
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="top"
                    color={toastMessage.includes('sucesso') ? 'success' : 'danger'}
                />

                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Confirmar troca"
                    message={selectedProduct ? 
                        `Deseja trocar ${selectedProduct.price} pontos por ${selectedProduct.name}?` : 
                        'Confirmar troca de pontos?'}
                    buttons={[
                        {
                            text: 'Cancelar',
                            role: 'cancel',
                            handler: () => {
                                setShowAlert(false);
                                setSelectedProduct(null);
                            },
                        },
                        {
                            text: 'Confirmar',
                            handler: handlePurchaseConfirmation,
                        },
                    ]}
                />
                
            </IonContent>
            <Toolbar />
        </IonPage>
    );
};

export default Store;