export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="lds-dual-ring"></div>
    </div>
  );
}
