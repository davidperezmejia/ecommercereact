import React,{useState, useEffect} from 'react'
import {Navbar} from './Navbar'
import {auth,fs} from '../Config/Config'
import { CartProducts } from './CartProducts';
import StripeCheckout from 'react-stripe-checkout';
import axios from 'axios';
import {useHistory} from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal } from './Modal';

toast.configure();

export const Cart = () => { 
       
    const [showModal, setShowModal]=useState(false);  
    const triggerModal=()=>{
        setShowModal(true);
    }
    const hideModal=()=>{
        setShowModal(false);
    }
        function GetCurrentUser(){
        const [user, setUser]=useState(null);
        useEffect(()=>{
            auth.onAuthStateChanged(user=>{
                if(user){
                    fs.collection('users').doc(user.uid).get().then(snapshot=>{
                        setUser(snapshot.data().FullName);
                    })
                }
                else{
                    setUser(null);
                }
            })
        },[])
        return user;
    }

    const user = GetCurrentUser();
      const [cartProducts, setCartProducts]=useState([]);

    useEffect(()=>{
        auth.onAuthStateChanged(user=>{
            if(user){
                fs.collection('Cart ' + user.uid).onSnapshot(snapshot=>{
                    const newCartProduct = snapshot.docs.map((doc)=>({
                        ID: doc.id,
                        ...doc.data(),
                    }));
                    setCartProducts(newCartProduct);                    
                })
            }
            else{
                console.log('user is not signed in to retrieve cart');
            }
        })
    },[])
    const qty = cartProducts.map(cartProduct=>{
        return cartProduct.qty;
    })

    const reducerOfQty = (accumulator, currentValue)=>accumulator+currentValue;

    const totalQty = qty.reduce(reducerOfQty,0);
    const price = cartProducts.map((cartProduct)=>{
        return cartProduct.TotalProductPrice;
    })

    const reducerOfPrice = (accumulator,currentValue)=>accumulator+currentValue;

    const totalPrice = price.reduce(reducerOfPrice,0);

    let Product;

    const cartProductIncrease=(cartProduct)=>{
        // console.log(cartProduct);
        Product=cartProduct;
        Product.qty=Product.qty+1;
        Product.TotalProductPrice=Product.qty*Product.price;
        auth.onAuthStateChanged(user=>{
            if(user){
                fs.collection('Cart ' + user.uid).doc(cartProduct.ID).update(Product).then(()=>{
                    console.log('Incremento agregado');
                })
            }
            else{
                console.log('El usuario no ha iniciado sesión en Increment');
            }
        })
    }

    const cartProductDecrease =(cartProduct)=>{
        Product=cartProduct;
        if(Product.qty > 1){
            Product.qty=Product.qty-1;
            Product.TotalProductPrice=Product.qty*Product.price;
              auth.onAuthStateChanged(user=>{
                if(user){
                    fs.collection('Cart ' + user.uid).doc(cartProduct.ID).update(Product).then(()=>{
                        console.log('decrement');
                    })
                }
                else{
                    console.log('El usuario no ha iniciado sesión ');
                }
            })
        }
    }

     const [totalProducts, setTotalProducts]=useState(0);
 
     useEffect(()=>{        
         auth.onAuthStateChanged(user=>{
             if(user){
                 fs.collection('Cart ' + user.uid).onSnapshot(snapshot=>{
                     const qty = snapshot.docs.length;
                     setTotalProducts(qty);
                 })
             }
         })       
     },[])

     const history = useHistory();
     const handleToken = async(token)=>{
        const cart = {name: 'Todos los Productos', totalPrice}
        const response = await axios.post('http://localhost:8080/checkout',{
            token,
            cart
        })
        console.log(response);
        let {status}=response.data;
        console.log(status);
        if(status==='success'){
            history.push('/');
            toast.success('Su pedido se ha realizado correctamente', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
              });
              
              const uid = auth.currentUser.uid;
              const carts = await fs.collection('Cart ' + uid).get();
              for(var snap of carts.docs){
                  fs.collection('Cart ' + uid).doc(snap.id).delete();
              }
        }
        else{
            alert('Algo salió mal en el proceso de pago');
        }
     }
   
    return (
        <>
            <Navbar user={user} totalProducts={totalProducts} />           
            <br></br>
            {cartProducts.length > 0 && (
                <div className='container-fluid'>
                    <h1 className='text-center'>Cart</h1>
                    <div className='products-box cart'>
                        <CartProducts cartProducts={cartProducts}
                           cartProductIncrease={cartProductIncrease}
                           cartProductDecrease={cartProductDecrease}
                        />
                    </div>
                    <div className='summary-box'>
                        <h5>Cart Summary</h5>
                        <br></br>
                        <div>
                        Total No of Products: <span>{totalQty}</span>
                        </div>
                        <div>
                        Total Price to Pay: <span>$ {totalPrice}</span>
                        </div>
                        <br></br>
                        <StripeCheckout
                            stripeKey='pk_test_51Hhu6bK4kL4WRmvGEUkTmdFw1lUtTAnadBSDb0eXGuA2JJGrntIBdm10llYu5RbPbLbaS1My74Rgdi0n5ePYIGB600p3V4GKmK'
                            token={handleToken}
                            billingAddress
                            shippingAddress
                            name='All Products'
                            amount={totalPrice * 100}
                        ></StripeCheckout> 
                         <h6 className='text-center'
                        style={{marginTop: 7+'px'}}>OR</h6>
                        <button className='btn btn-secondary btn-md' 
                        onClick={()=>triggerModal()}>Devolucion de dinero</button>                                                                                                                                             
                    </div>                                    
                </div>
            )}
            {cartProducts.length < 1 && (
                <div className='container-fluid'>No hay productos para mostrar</div>
            ) }

            {showModal===true&&(
                <Modal TotalPrice={totalPrice} totalQty={totalQty}
                    hideModal={hideModal}
                />
            )}          
                            
        </>
    )
}