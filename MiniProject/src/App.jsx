import './App.css'
import Card from './Card'
import data from './CardData'
import Header from './Header'
import Herosectio from './Herosectio'

function App() {

  return (
<>   
    <Header />
    <Herosectio />
    <div className='container'>
  
     {data.map((ele, ind) => (
              <Card key={ind}
              Img={ele.Image}
              Fname={ele.Name}
              Job={ele.Desig}
              />
              
            ))
      }

            
    </div>
    </>
  )

      }
export default App
