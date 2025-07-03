import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { apiGet } from '@/lib/api/main';

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function VehiculosMasRentados() {
  const [isMounted, setIsMounted] = useState(false);
  const [chartData, setChartData] = useState({
    series: [{ name: "Rentas", data: [] }],
    options: {
      chart: {
        type: "bar",
        height: 300,
      },
      plotOptions: {
        bar: {
          horizontal: true, // Barras horizontales
        },
      },
      xaxis: {
        categories: [],
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#4361ee"],
      fill: {
        opacity: 0.8,
      },
      grid: {
        borderColor: "#e0e6ed",
      },
      stroke: {
        width: 1,
      },
    },
  });
  
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true); // Iniciar carga
      const data = (await apiGet({ path: 'rentadevolucion/masrentados' })).info;
      const vehicleNames = data?.map((item: any) => `${item.descripcion} - ${item.NoPlaca}`);
      const rentCounts = data?.map((item: any) => item.cantidad_rentas);

      setChartData((prev) => ({
        ...prev,
        series: [{ name: "Rentas", data: rentCounts }],
        options: {
          ...prev.options,
          xaxis: { categories: vehicleNames },
        },
      }));
    } catch (error) {
      console.error("Error al cargar los vehículos más rentados:", error);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false); // Finaliza carga
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-black p-4">
      <h2 className="text-lg font-semibold mb-4">Vehículos Más Rentados</h2>

      {loading && <div className="text-center text-gray-500">Cargando...</div>}

      {error && !loading && <div className="text-center text-red-500">{error}</div>}

      {isMounted && !loading && !error && (
        <ReactApexChart
          series={chartData.series}
          options={chartData.options}
          type="bar"
          height={300}
          width={"100%"}
        />
      )}
    </div>
  );
}
