
interface LeftAuthLayoutProps {
  description: string;
}

const LeftAuthLayout = ({description}: LeftAuthLayoutProps) =>{
  return (
    <>
    
    <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center p-10">
      
      <div className="max-w-md">
        <h1 className="text-4xl font-bold">Welcome to ConstructHub</h1>
        <p className="mt-4 text-xl">{description}</p>
      </div>
    </div>
    
    </>
  )
}

export default LeftAuthLayout