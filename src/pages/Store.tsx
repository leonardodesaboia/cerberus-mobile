import { IonPage, IonContent, IonCard, IonText, IonLabel, IonImg, IonAlert } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useState, useEffect, useCallback } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Store.css';
import Toolbar from '../components/Toolbar';
import Header from '../components/Header';
import { updateUserPoints, products } from '../services/api';

interface Product {
    _id: string;
    name: string;
    price: number;
    img: string;
    isActive: boolean;
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

    // Callback para atualizar os pontos
    const handlePointsUpdate = useCallback((points: number) => {
        setUserPoints(points);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsData = await products({});
                const activeProducts = productsData.filter((product: Product) => product.isActive);

                const sections: Section[] = [
                    {
                        title: 'Até 20 pontos',
                        products: activeProducts.filter((p: Product) => p.price <= 20)
                    },
                    {
                        title: 'Até 40 pontos',
                        products: activeProducts.filter((p: Product) => p.price > 20 && p.price <= 40)
                    },
                    {
                        title: 'Acima de 40 pontos',
                        products: activeProducts.filter((p: Product) => p.price > 40)
                    }
                ];

                setProductSections(sections.filter(section => section.products.length > 0));
            } catch (err) {
                setError('Erro ao carregar produtos');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleProductClick = (product: Product) => {
        if (userPoints < product.price) {
            setError('Pontos insuficientes para esta troca');
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
            await updateUserPoints(newPoints);
            setUserPoints(newPoints); // Atualiza os pontos localmente
            setShowAlert(false);
            setSelectedProduct(null);
            setError(null);
        } catch (err) {
            setError('Erro ao processar a troca');
        }
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent>
                    <div className="loading-container">
                        Carregando...
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <Header onPointsUpdate={handlePointsUpdate} />

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
                                slidesPerView={4.3}
                                className="products-swiper"
                            >
                                {section.products.map((product) => (
                                    <SwiperSlide key={product._id}>
                                        <IonCard 
                                            className="product-card"
                                            onClick={() => handleProductClick(product)}
                                        >
                                            <IonImg 
                                                src={product.img}
                                                alt={product.name}
                                                className="product-image"
                                            />
                                            <IonLabel className="product-name">{product.name}</IonLabel>
                                            <br/>
                                            <IonLabel className="product-points">{product.price} pontos</IonLabel>
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