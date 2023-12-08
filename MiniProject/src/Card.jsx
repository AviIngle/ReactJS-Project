import React from 'react'

function Card(props) {
  // console.log(props);
  return (


    <div id='card'>
      <img src={props.Img} alt="Image Not loading" />
      <h2>Name: {props.Fname}</h2>
      <h3>Designation: {props.Job}</h3>
    </div>

  )
}

export default Card