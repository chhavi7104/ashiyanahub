import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStats } from '../features/admin/adminSlice';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getStats());
  }, [dispatch]);

  if (!stats) return <div>Loading...</div>;

  const propertiesByTypeData = {
    labels: stats.propertiesByType.map((item) => item._id),
    datasets: [
      {
        label: 'Properties by Type',
        data: stats.propertiesByType.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  const propertiesByStatusData = {
    labels: stats.propertiesByStatus.map((item) => item._id),
    datasets: [
      {
        label: 'Properties by Status',
        data: stats.propertiesByStatus.map((item) => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'User Growth',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats.usersCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Properties</h3>
          <p className="text-3xl font-bold">{stats.propertiesCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Registered Agents</h3>
          <p className="text-3xl font-bold">{stats.agentsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Properties by Type</h3>
          <div className="h-64">
            <Pie data={propertiesByTypeData} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Properties by Status</h3>
          <div className="h-64">
            <Bar data={propertiesByStatusData} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
        <div className="h-64">
          <Line data={userGrowthData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Properties</h3>
          <ul className="space-y-3">
            {stats.recentProperties.map((property) => (
              <li key={property._id} className="border-b pb-2">
                <p className="font-medium">{property.title}</p>
                <p className="text-sm text-gray-600">
                  Added by {property.agent.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <ul className="space-y-3">
            {stats.recentUsers.map((user) => (
              <li key={user._id} className="border-b pb-2">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;