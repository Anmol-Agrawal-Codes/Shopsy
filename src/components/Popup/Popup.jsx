import React, { useMemo, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

const Popup = ({ orderPopup, setOrderPopup }) => {

  const [rerender, triggerRerender] = useState()

  const products = JSON.parse(localStorage.getItem("cart")) || []

  function removeFromCart(id) {
    const updatedProducts = products.filter((item, idx) => idx !== id)
    localStorage.setItem("cart", JSON.stringify(updatedProducts))
    triggerRerender(new Date().getTime())
  }

  return (
    <>
      {orderPopup && (
        <div className="popup">
          <div className="h-screen w-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm">
            <div className="overflow-y-scroll fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 shadow-md bg-white dark:bg-gray-900 rounded-md duration-200 w-9/12 h-4/6">
              {/* header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1>Cart</h1>
                </div>
                <div>
                  <IoCloseOutline
                    className="text-2xl cursor-pointer "
                    onClick={() => setOrderPopup(false)}
                  />
                </div>
              </div>
              {/* form section */}
              <div className="mt-2 flex flex-col gap-2">
                {(products ?? []).map((item, idx) => (
                  <div key={idx} className="border rounded p-2 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-5 h-full">
                      <div className="flex items-center rounded overflow-hidden">
                        <img className="w-[70px] h-auto" src={item?.img} alt="Loading..." />
                      </div>
                      {item?.title}
                    </div>
                    <div onClick={() => removeFromCart(idx)}>
                      <button><MdDelete fontSize={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
