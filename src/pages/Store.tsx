import { IonPage, IonContent, IonCard, IonText, IonLabel, IonImg, IonAlert, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Store.css';
import Toolbar from '../components/Toolbar';
import Header from '../components/Header';
import { updateUserPoints, fetchProducts, getUserData,redeemProduct } from '../services/api';
import PointsUpdateEvent from '../utils/pointsUpdateEvent';

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
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSections, setProductSections] = useState<Section[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [userPoints, setUserPoints] = useState<number>(0);
    const [shouldRefreshHeader, setShouldRefreshHeader] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
                        title: 'Até 2000 pontos',
                        products: activeProducts.filter((p: Product) => p.price <= 2000)
                    },
                    {
                        title: 'Até 40 pontos',
                        products: activeProducts.filter((p: Product) => p.price > 20 && p.price <= 40)
                    },
                    {
                        title: 'Acima de 2000 pontos',
                        products: activeProducts.filter((p: Product) => p.price > 2000)
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
            setError('Pontos insuficientes para esta troca');
            setTimeout(() => {
                setError('');
            },5000)
            return;
        }
        setSelectedProduct(product);
        setShowAlert(true);
    };

    const handlePurchaseConfirmation = async () => {
        if (!selectedProduct) return;
    
        const newPoints = userPoints - selectedProduct.price;
    
        if (newPoints < 0) {
            setError('Pontos insuficientes para esta troca');
            return;
        }
    
        try {
            setLoading(true);
            console.log("Iniciando processo de resgate do produto:", selectedProduct.name);
            
            // Usar redeemProduct ao invés de updateUserPoints
            const updatedUserData = await redeemProduct(selectedProduct);
            console.log("Produto resgatado com sucesso. Dados atualizados:", updatedUserData);
            
            // Verificar explicitamente se o produto foi adicionado
            const productAdded = updatedUserData.redeemed?.some(p => p._id === selectedProduct._id);
            console.log("Produto encontrado na lista de resgatados:", productAdded ? "Sim" : "Não");
            
            // Atualizar interface
            setUserPoints(newPoints);
            PointsUpdateEvent.emit();
            
            setShowAlert(false);
            setSelectedProduct(null);
            setError(null);
            setSuccessMessage(`${selectedProduct.name} resgatado com sucesso!`);
            
            // Redirecionar para página de resgates após sucesso
            console.log("Redirecionando para página de resgates...");

        } catch (err: any) {
            console.error('Erro ao processar a troca:', err);
            setError(`Erro ao processar a troca: ${err.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent>
                    <div className="loader">
                        <div className="spinner"></div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <Header />

                <div className="store-content">
                    <IonText className="title-text">
                        <h2 className="products-title">Troque seus pontos por produtos</h2>
                    </IonText>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {productSections.map((section, index) => (
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
                                    <SwiperSlide key={product._id}>
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
                    ))}
                </div>

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

