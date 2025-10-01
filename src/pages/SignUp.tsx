import AuthLayout from "../layouts/AuthLayout";
import SignUpCard from "../components/SignUpCard";


const SignUp = () =>{
  return (
    <AuthLayout description="Create an account to access cost estimation tools, find technicians, and purchase materials seamlessly.">
      <SignUpCard />
    </AuthLayout>
  )
}

export default SignUp