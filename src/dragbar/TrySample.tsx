export function TrySample() {
  const handleTrySample = async () => {
    try {
      const response = await fetch('/openapi.json');
      if (!response.ok) {
        throw new Error('Failed to fetch sample API');
      }
      const sampleApi = await response.json();
      (window as any).editor?.setValue(JSON.stringify(sampleApi, null, 4));
    } catch (error) {
      console.error('Error loading sample API:', error);
      alert('Failed to load sample API');
    }
  };

  return (
    <button

    id = "try-sample"
      onClick={(e) => {
        e.stopPropagation();
        handleTrySample();
      }}
    >
      Try sample
    </button>
  );
} 