const Login = () => {
  return (
    <>
      <div className="bg-gray-300 dark:bg-background-dark items-center justify-content-center rounded-xl">
        <div>
          <h4 className="flex items-center justify-center h-16 text-2xl font-bold text-brand-light dark:text-brand-dark">Login Form</h4>
        </div>
        <form>
          <input  placeholder="enter username">
          </input>
          <input placeholder="enter password">
          </input>
        </form>
      </div>
    </>
  )
}

export default Login