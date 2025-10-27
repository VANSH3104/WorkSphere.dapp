export const DashboardComponent = ({ user }: { user: any }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}