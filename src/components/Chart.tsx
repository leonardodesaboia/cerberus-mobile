import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { IonCard, IonCardContent } from '@ionic/react';
import "../styles/Chart.css";
import { getUserData } from '../services/api';
import { useEffect, useState } from 'react';

interface ColorMap {
    [key: string]: string;
}

interface ChartData {
    name: string;
    amount: number;
    percentage?: number;
}

interface UserData {
    plasticDiscarded: number;
    metalDiscarded: number;
}

const COLORS: ColorMap = { 
    Plástico: "#174204", 
    Metal: "#86C26D" 
};

const TrashChart: React.FC = () => {
    const [data, setData] = useState<ChartData[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true);
                const userData: UserData = await getUserData();
                const totalAmount: number = userData.plasticDiscarded + userData.metalDiscarded;
                
                const filterData: ChartData[] = [
                    { 
                        name: "Plástico", 
                        amount: userData.plasticDiscarded || 0,
                        percentage: totalAmount > 0 ? (userData.plasticDiscarded / totalAmount) * 100 : 0
                    },
                    { 
                        name: "Metal", 
                        amount: userData.metalDiscarded || 0,
                        percentage: totalAmount > 0 ? (userData.metalDiscarded / totalAmount) * 100 : 0
                    }
                ];
                
                setData(filterData);
                setTotal(totalAmount);
            } catch (error) {
                console.error("Erro ao obter dados do usuário", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        
        // Em telas muito pequenas, não mostra o label
        if (window.innerWidth < 340 || percent < 0.1) return null;
        
        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ 
                    fontSize: window.innerWidth < 768 ? '10px' : '12px', 
                    fontWeight: 'bold' 
                }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Renderiza mensagem se não houver dados de descarte
    const renderEmptyState = () => (
        <div className="empty-chart-message">
            <p>Você ainda não realizou nenhum descarte.</p>
            <p>Comece a descartar seus resíduos e contribua para um mundo mais sustentável!</p>
        </div>
    );

    // Renderiza o gráfico se houver dados
    const renderChart = () => (
        <>
            <div className="chart-header">
                <h3>Resumo de Descartes</h3>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie 
                        data={data} 
                        dataKey="amount" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80}
                        innerRadius={0}
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {data.map((entry: ChartData) => (
                            <Cell 
                                key={entry.name} 
                                fill={COLORS[entry.name]} 
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value) => [`${value} Descartados`, '']}
                        contentStyle={{ background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="legend-container">
                {data.map((entry: ChartData) => {
                    const percentage = total > 0 
                        ? ((entry.amount / total) * 100).toFixed(1) 
                        : '0';
                        
                    return (
                        <div key={entry.name} className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: COLORS[entry.name] }}
                            ></span>
                            {entry.name}: {entry.amount} Descartados ({percentage}%)
                        </div>
                    );
                })}
            </div>
            
            <div className="total-descartados">
                Total: {total} Descartados
            </div>
        </>
    );

    return (
        <div className="stats-section">
            <h2 className="achievements-title-home">Suas estatísticas</h2>
            
            <IonCard className="stats-card">
                <IonCardContent className="chart-container">
                    {loading ? (
                        <div className="loading-message">Carregando dados...</div>
                    ) : total === 0 ? (
                        renderEmptyState()
                    ) : (
                        renderChart()
                    )}
                </IonCardContent>
            </IonCard>
        </div>
    );
};

export default TrashChart;