const AddToCart = ({ item, className }) => {

    const handleAddItem = () => {
        const prevProducts = JSON.parse(localStorage.getItem("cart")) || []
        prevProducts.push(item)
        localStorage.setItem("cart", JSON.stringify(prevProducts))
    }

    return (
        <div onClick={handleAddItem} className={`${className} bg-primary text-white rounded-md px-4 py-1 text-sm w-max hover:bg-primary/70 transition-all delay-180 cursor-pointer`}>Add to Cart</div>
    )
}

export default AddToCart;