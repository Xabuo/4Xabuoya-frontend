import api from "../api/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Heart,
  X,
  Bell,
  CheckCheck,
  ClipboardList,
  UserRound,
} from "lucide-react";
import "../App.css";



const categories = [
  "Cake",
  "Pasta",
  "Snacks",
  "Coffee",
  "Beverage",
  "Noodles",
  "Steak",
  "Japanese Cuisine",
  "Seafood",
  "Chicken",
];




// COUPONS
const coupons = [
  {
    id: 1,
    code: "WELCOME150",
    title: "₱150 Off Coupon",
    discount: "₱150",
    discountLabel: "OFF",
    minimumText: "₱1k+",
    expiration: "Expiring: 14 hours left",
  },
  {
    id: 2,
    code: "SAVE10",
    title: "10% Off Coupon",
    discount: "10%",
    discountLabel: "OFF",
    minimumText: "₱1,000",
    maximumText: "Maximum discount: ₱1,500",
    expiration: "Expiring: 9 hours left",
  },
  {
    id: 3,
    code: "SAVE12",
    title: "12% Off Coupon",
    discount: "12%",
    discountLabel: "OFF",
    minimumText: "₱499",
    maximumText: "Maximum discount: ₱100",
    expiration: "Expired: 17.09.2026",
  },
  {
    id: 4,
    code: "SAVE25",
    title: "25% Off Coupon",
    discount: "25%",
    discountLabel: "OFF",
    minimumText: "₱50",
    maximumText: "Maximum discount: ₱50",
    expiration: "Valid till: 18.11.2026",
  },
  {
    id: 5,
    code: "FREESHIP",
    title: "Free Shipping Coupon",
    discount: "FREE",
    discountLabel: "SHIPPING",
    minimumText: "₱150",
    expiration: "Expiring: 14 hours left",
  },
];


const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  });

function readSavedData(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function readWishlist() {
  return readSavedData("4xabuoya-wishlist");
}

function readSavedCart() {
  return readSavedData("4xabuoya-cart").filter(
    (item) =>
      item &&
      Number.isInteger(item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
  );
}

function App() {
  
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  // PRODUCT DETAILS AND REVIEWS
const [selectedProduct, setSelectedProduct] = useState(null);
const [productReviews, setProductReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [reviewScore, setReviewScore] = useState(5);
const [reviewComment, setReviewComment] = useState("");
const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeOrderStatus, setActiveOrderStatus] = useState("All");
  
// CUSTOMER AUTHENTICATION
const handleLogout = async () => {
  try {
    await api.post(
      "/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    console.log("AUTH TOKEN:", authToken);
    console.log("CUSTOMER:", customer);
  }

  localStorage.removeItem("4xabuoya-customer");
  localStorage.removeItem("4xabuoya-token");

  setCustomer(null);
  setAuthToken("");
  setShowAccountMenu(false);

  alert("You have logged out.");
};
const [customer, setCustomer] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("4xabuoya-customer")
    );
  } catch {
    return null;
  }
});

const [authToken, setAuthToken] = useState(
  () => localStorage.getItem("4xabuoya-token")
);

const [showAuth, setShowAuth] = useState(false);
const [authMode, setAuthMode] = useState("register");

const [authForm, setAuthForm] = useState({
  first_name: "",
  last_name: "",
  email: "",
  contact_number: "",
  address: "",
  password: "",
  password_confirmation: "",
});

const [authError, setAuthError] = useState("");
const [authLoading, setAuthLoading] = useState(false);

const handleAuthSubmit = async (e) => {
  e.preventDefault();

  setAuthError("");
  setAuthLoading(true);

  try {
    const endpoint =
      authMode === "register" ? "/register" : "/login";

    const payload =
      authMode === "register"
        ? authForm
        : {
            email: authForm.email,
            password: authForm.password,
          };

    const response = await api.post(endpoint, payload);

    const { customer: loggedInCustomer, token } = response.data;

    console.log("LOGIN RESPONSE:", response.data);
console.log("TOKEN RECEIVED:", Boolean(token));

    localStorage.setItem(
      "4xabuoya-customer",
      JSON.stringify(loggedInCustomer)
    );

    localStorage.setItem("4xabuoya-token", token);

    setCustomer(loggedInCustomer);
    setAuthToken(token);
    setShowAuth(false);

    const testAuth = await api.get("/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log("AUTHENTICATED CUSTOMER:", testAuth.data);

    setAuthForm({
      first_name: "",
      last_name: "",
      email: "",
      contact_number: "",
      address: "",
      password: "",
      password_confirmation: "",
    });

    alert(
      authMode === "register"
        ? "Account created successfully!"
        : "Login successful!"
    );
  } catch (error) {
    const errors = error.response?.data?.errors;

    setAuthError(
      errors
        ? Object.values(errors).flat().join("\n")
        : error.response?.data?.message ||
            "Something went wrong. Please try again."
    );
  } finally {
    setAuthLoading(false);
  }
};

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const [productResponse, categoryResponse] = await Promise.all([
        api.get("/products"),
        api.get("/category"),
      ]);

      const productData = productResponse.data.data || [];
      const categoryData = categoryResponse.data.data || [];

      console.log("PRODUCT API RESPONSE:", productResponse.data);
      console.log("PRODUCT DATA:", productData);

      const formattedProducts = productData.map((product) => {
        const category = categoryData.find(
          (item) => Number(item.id) === Number(product.category_id)
        );

        return {
          ...product,
          id: Number(product.id),
          name: product.product_name,
          category: category?.name || "Uncategorized",
          description: product.product_description || "",
          image: product.image_url || "",
          rating: product.average_rating ?? null,
          sold: product.sold ?? 0,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      setProductsError("Unable to load products. Please try again.");
    } finally {
      setProductsLoading(false);
    }
  };

  fetchProducts();
}, []);

// LOAD REVIEWS WHEN A PRODUCT IS SELECTED
useEffect(() => {
  if (!selectedProduct) return;

  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const response = await api.get("/rating-and-review");

      const allReviews = response.data.data || [];

      const filteredReviews = allReviews.filter(
        (review) =>
          Number(review.product_id) === Number(selectedProduct.id)
      );

// SUBMIT CUSTOMER REVIEW
const handleSubmitReview = async (e) => {
  e.preventDefault();

  if (!customer || !authToken) {
    setAuthMode("login");
    setShowAuth(true);
    return;
  }

  if (!selectedProduct) return;

  setReviewSubmitting(true);

  try {
    const response = await api.post(
      "/rating-and-review",
      {
        product_id: selectedProduct.id,
        score: reviewScore,
        comment: reviewComment,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const newReview = response.data.data || response.data;

    setProductReviews((previousReviews) => [
      newReview,
      ...previousReviews,
    ]);

    setReviewScore(5);
    setReviewComment("");

    alert("Your review was submitted successfully!");
  } catch (error) {
    console.error(
      "SUBMIT REVIEW ERROR:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
      "Unable to submit your review. Please try again."
    );
  } finally {
    setReviewSubmitting(false);
  }
};


      setProductReviews(filteredReviews);
    } catch (error) {
      console.error(
        "FETCH REVIEWS ERROR:",
        error.response?.data || error
      );
      setProductReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  fetchReviews();
}, [selectedProduct]);

// SUBMIT CUSTOMER REVIEW
const handleSubmitReview = async (e) => {
  e.preventDefault();

  if (!customer || !authToken) {
    setAuthMode("login");
    setShowAuth(true);
    return;
  }

  if (!selectedProduct) return;

  setReviewSubmitting(true);

  try {
    const response = await api.post(
      "/rating-and-review",
      {
        product_id: selectedProduct.id,
        score: reviewScore,
        comment: reviewComment,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const newReview = response.data.data || response.data;

    setProductReviews((previousReviews) => [
      newReview,
      ...previousReviews,
    ]);

    setReviewScore(5);
    setReviewComment("");

    alert("Your review was submitted successfully!");
  } catch (error) {
    console.error(
      "SUBMIT REVIEW ERROR:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
      "Unable to submit your review. Please try again."
    );
  } finally {
    setReviewSubmitting(false);
  }
};

  // SAVED DATA
  const [wishlist, setWishlist] = useState(readWishlist);
  const [cart, setCart] = useState(readSavedCart);
 const [checkout, setCheckout] = useState({
  payment_method: "Cash on Delivery",
});

const customerName = customer
  ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
  : "";

const customerAddress = customer?.address || "";

const [placingOrder, setPlacingOrder] = useState(false);
const [checkoutError, setCheckoutError] = useState("");
const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [notifications, setNotifications] = useState(() =>
    readSavedData("4xabuoya-notifications")
  );

  // PAGE AND PANEL STATE
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCartMessage, setShowCartMessage] = useState(false);

  // KEEP THIS AFTER ALL STATE DECLARATIONS
  const isHomePage =
    !showCategories &&
    !showCoupons &&
    !showWishlist &&
    !showOrders &&
    !showCart &&
    !showNotifications;

    const openCart = () => {
  setShowCart(true);
  setShowNotifications(false);
  setShowWishlist(false);
  setShowCoupons(false);
  setShowCategories(false);
  setShowOrders(false);
};

const openNotifications = () => {
  setShowNotifications(true);
  setShowCart(false);
  setShowWishlist(false);
  setShowCoupons(false);
  setShowCategories(false);
  setShowOrders(false);
};
const [orders, setOrders] = useState(() =>
  readSavedData("4xabuoya-orders")
);

// FETCH CUSTOMER ORDERS FROM LARAVEL
const fetchOrders = async () => {
  try {
    const response = await api.get("/order", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const savedOrders = response.data.data || [];

    const formattedOrders = savedOrders.map((savedOrder) => ({
      id: savedOrder.id,
      items: (savedOrder.items || []).map((item) => ({
        id: item.product_id,
        name: item.product?.product_name || "Product",
        price: Number(item.unit_price || 0),
        quantity: Number(item.quantity || 0),
      })),
      subtotal: Number(savedOrder.subtotal || 0),
      shipping_fee: Number(savedOrder.shipping_fee || 0),
      tax: Number(savedOrder.tax || 0),
      coupon_code: savedOrder.coupon_code || null,
      discount_amount: Number(savedOrder.discount_amount || 0),
      total: Number(
        savedOrder.grand_total ??
        savedOrder.total_amount ??
        0
      ),
      status: savedOrder.order_status || "Pending",
      order_status: savedOrder.order_status || "Pending",
      createdAt: savedOrder.created_at,
    }));

    setOrders((currentOrders) => {
  const oldLocalOrders = currentOrders.filter(
    (oldOrder) =>
      !formattedOrders.some(
        (newOrder) =>
          String(newOrder.id) === String(oldOrder.id)
      )
  );

  return [...formattedOrders, ...oldLocalOrders];
});



  } catch (error) {
    console.error(
      "FETCH ORDERS ERROR:",
      error.response?.data || error
    );
  }
};

// LOAD ORDERS WHEN CUSTOMER LOGS IN
useEffect(() => {
  if (authToken) {
    fetchOrders();
  }
}, [authToken]);

// CANCEL ORDER
const handleCancelOrder = async (orderId) => {
  console.log("CANCEL BUTTON CLICKED:", orderId);

  if (!window.confirm("Are you sure you want to cancel this order?")) {
    return;
  }

  try {
    const response = await api.post(
      `/order/${orderId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log("CANCEL RESPONSE:", response.data);

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        String(order.id) === String(orderId)
          ? {
              ...order,
              order_status: "Cancelled",
              status: "Cancelled",
            }
          : order
      )
    );

    alert("Order cancelled successfully!");
  } catch (error) {
    console.error("CANCEL ERROR:", error.response?.data || error);

    alert(
      error.response?.data?.message ||
      "Failed to cancel order."
    );
  }
};
  // COUNTS AND TOTALS
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  
const cartTotal = cart.reduce((total, item) => {
  const product = products.find((p) => p.id === item.id);
  return total + (product ? product.price * item.quantity : 0);
}, 0);

// COUPON AND DELIVERY CALCULATIONS
const shippingFee =
  selectedCoupon?.code === "FREESHIP" && cartTotal >= 150 ? 0 : 50;

const couponDiscount = (() => {
  if (!selectedCoupon) return 0;

  switch (selectedCoupon.code) {
    case "WELCOME150":
      return cartTotal >= 1000 ? 150 : 0;

    case "SAVE10":
      return cartTotal >= 1000
        ? Math.min(cartTotal * 0.10, 1500)
        : 0;

    case "SAVE25":
      return cartTotal >= 50
        ? Math.min(cartTotal * 0.25, 50)
        : 0;

    case "FREESHIP":
      return 0;

    default:
      return 0;
  }
})();

const finalCartTotal = Math.max(
  0,
  cartTotal + shippingFee - couponDiscount
);

const couponMinimum = {
  WELCOME150: 1000,
  SAVE10: 1000,
  SAVE25: 50,
  FREESHIP: 150,
};

const couponEligible =
  selectedCoupon &&
  cartTotal >= (couponMinimum[selectedCoupon.code] || 0);

const cartItemCount = cart.reduce(
  (total, item) => total + item.quantity,
  0
);


  // SAVE DATA
  useEffect(() => {
    localStorage.setItem(
      "4xabuoya-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("4xabuoya-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("4xabuoya-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(
      "4xabuoya-notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // CLOSE ALL OTHER PAGES
  const closeAllPages = () => {
    setShowCategories(false);
    setShowCoupons(false);
    setShowWishlist(false);
    setShowOrders(false);
    setShowCart(false);
    setShowNotifications(false);
  };

  // HOME PAGE
  const showHome = (event) => {
    if (event) event.preventDefault();

    closeAllPages();
    setActiveCategory("All");
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // CATEGORIES PAGE
  // preserveSearch is used when submitting a product search.
  const openCategories = (preserveSearch = false) => {
    closeAllPages();
    setShowCategories(true);
    setActiveCategory("All");

    if (!preserveSearch) {
      setSearch("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseCategory = (category) => {
    closeAllPages();
    setShowCategories(true);
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const browseProducts = () => {
    openCategories();
  };

  // COUPONS PAGE
  const openCoupons = (event) => {
    if (event) event.preventDefault();

    closeAllPages();
    setShowCoupons(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUseCoupon = (coupon) => {
  if (coupon.code === "SAVE12") {
    alert("Sorry, this coupon has expired.");
    return;
  }

  setSelectedCoupon(coupon);
  setShowCoupons(false);
  setShowCart(true);
};

  // WISHLIST PAGE
  const openWishlist = (event) => {
    if (event) event.preventDefault();

    closeAllPages();
    setShowWishlist(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const alreadySaved = currentWishlist.some(
        (item) => item.id === product.id
      );

      if (alreadySaved) {
        return currentWishlist.filter(
          (item) => item.id !== product.id
        );
      }

      return [...currentWishlist, product];
    });
  };

  // NOTIFICATIONS
  const addNotification = (title, message, orderId = null) => {
    setNotifications((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        title,
        message,
        orderId,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...current,
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  };

  const openNotification = (notification) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, read: true }
          : item
      )
    );

    closeAllPages();

    if (notification.orderId) {
      setShowOrders(true);
    } else {
      setShowNotifications(true);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // CART
  
const addToCart = (product) => {

  // Check if the user is logged in
  if (!customer) {
    alert("Please create an account or log in first before adding items to your cart.");
    return;
  }

  const alreadyExists = cart.some(
    (item) => item.id === product.id
  );

  const removeFromCart = (productId) => {
    setCart((current) =>
      current.filter((item) => item.id !== productId)
    );
  };


  if (!alreadyExists && cart.length >= 100) {
    alert("You can only add 100 different products to your cart.");
    return;
  }

  setCart((current) => {
    const existing = current.find(
      (item) => item.id === product.id
    );

    if (existing) {
      return current.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...current, { id: product.id, quantity: 1 }];
  });

  setShowCartMessage(true);
};

const updateQuantity = (productId, change) => {
  const existing = cart.find(
    (item) => item.id === productId
  );

  if (!existing) return;

  if (change > 0 && existing.quantity >= 100) {
    alert("Maximum quantity is 100 per product.");
    return;
  }

  setCart((current) =>
    current
      .map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: Math.min(
                100,
                item.quantity + change
              ),
            }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

const removeFromCart = (productId) => {
  setCart((current) =>
    current.filter((item) => item.id !== productId)
  );
};



  // ORDERS
  const openOrders = (event) => {
    if (event) event.preventDefault();

    closeAllPages();
    setShowOrders(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  
const placeOrder = async (event) => {
  event.preventDefault();

  if (cart.length === 0) return;

  setPlacingOrder(true);
  setCheckoutError("");

  try {
    const response = await api.post(
  "/order",
  {
  shipping_address: customer.address,
  payment_method: checkout.payment_method,
  coupon_code: selectedCoupon?.code || null,
  items: cart.map((item) => ({
    product_id: item.id,
    quantity: item.quantity,
  })),
},
  {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }
);

    const savedOrder = response.data.data;

    // Convert Laravel response to the format used by your Orders page
    
const order = {
  id: savedOrder.id,
  items: (savedOrder.items || []).map((item) => ({
    id: item.product_id,
    name: item.product?.product_name || "Product",
    price: Number(item.unit_price),
    quantity: item.quantity,
  })),
  subtotal: Number(savedOrder.subtotal || 0),
  shipping_fee: Number(savedOrder.shipping_fee || 0),
  tax: Number(savedOrder.tax || 0),
  coupon_code: savedOrder.coupon_code || null,
  discount_amount: Number(savedOrder.discount_amount || 0),
total: Number(
  savedOrder.grand_total ??
  savedOrder.total_amount ??
  0
),
  status: savedOrder.order_status || "Pending",
  order_status: savedOrder.order_status || "Pending",
  createdAt: savedOrder.created_at,
};


    setOrders((current) => [order, ...current]);

    addNotification(
      "Order placed successfully!",
      `Your order #${order.id} has been placed and is pending confirmation.`,
      order.id
    );

    setCart([]);

    setSelectedCoupon(null);
    setCheckout({
      payment_method: "Cash on Delivery",
    });

    closeAllPages();
    setShowOrders(true);

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (error) {
  console.error("ORDER ERROR:", error);
  console.error("STATUS:", error.response?.status);
  console.error("SERVER MESSAGE:", error.response?.data);


    const validationErrors = error.response?.data?.errors;

    if (validationErrors) {
      setCheckoutError(
        Object.values(validationErrors).flat().join(" ")
      );
    } else {
      setCheckoutError(
        error.response?.data?.message ||
        "Unable to place your order. Please try again."
      );
    }
  } finally {
    setPlacingOrder(false);
  }
};

  // PRODUCT SEARCH
  const searchText = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  const displayedWishlist = wishlist.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText)
    );
  });

  
  const renderProductCards = (items) =>
    items.length > 0 ? (
      <div className="product-grid">
        {items.map((product) => {
          const isSaved = wishlist.some(
            (item) => item.id === product.id
          );

          return (
            <article className="product-card" key={product.id}>
              <div
                className="image-container"
                style={{
                  "--product-bg": `url("${product.image}")`,
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />

                <span className="product-category">
                  {product.category}
                </span>
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="description">
                  {product.description}
                </p>
                <button
  className="view-details-button"
  onClick={() => setSelectedProduct(product)}
>
  View Details
</button>
                <div className="product-rating">
                  <span>★</span> {product.rating}
                  <span className="rating-divider">|</span>
                  <span className="sold-count">
                    {product.sold} sold
                  </span>
                </div>

                <div className="product-footer">
                  <strong className="product-price">
                    {formatPrice(product.price)}
                  </strong>

                  <div className="product-actions">
                    <button
                      type="button"
                      className={`wishlist-button ${
                        isSaved ? "is-saved" : ""
                      }`}
                      onClick={() => toggleWishlist(product)}
                      aria-label={
                        isSaved
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                    >
                      <Heart
                        size={14}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                      {isSaved ? "Saved" : "Wishlist"}
                    </button>

                    <button
                      type="button"
                      className="add-to-cart"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    ) : (
      <div className="empty-state">
        <span className="empty-icon">
          {showWishlist ? "♡" : "⌕"}
        </span>

        <h3>
          {showWishlist
            ? "Your wishlist is empty"
            : "No products found"}
        </h3>

        <p>
          {showWishlist
            ? "Save the products you love by clicking the Wishlist button."
            : "Try another search term or choose a different category."}
        </p>

        {showWishlist && (
          <button
            type="button"
            className="shop-button"
            onClick={browseProducts}
          >
            Browse Products
          </button>
        )}
      </div>
    );


 return (
  <>
    {showAuth && (
  <div className="auth-overlay">
    <div className="auth-modal">
      <button
        type="button"
        className="auth-close"
        onClick={() => setShowAuth(false)}
      >
        <X size={22} />
      </button>

      <h2>
        {authMode === "register" ? "Create Your Account" : "Welcome Back!"}
      </h2>

      <p>
        {authMode === "register"
          ? "Sign up to start ordering your favorite food."
          : "Log in to continue ordering."}
      </p>

      <form onSubmit={handleAuthSubmit}>
        {authMode === "register" && (
          <>
            <input
              placeholder="First Name"
              value={authForm.first_name}
              onChange={(e) =>
                setAuthForm({ ...authForm, first_name: e.target.value })
              }
              required
            />

            <input
              placeholder="Last Name"
              value={authForm.last_name}
              onChange={(e) =>
                setAuthForm({ ...authForm, last_name: e.target.value })
              }
              required
            />

            <input
              placeholder="Contact Number"
              value={authForm.contact_number}
              onChange={(e) =>
                setAuthForm({ ...authForm, contact_number: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Complete Delivery Address"
              value={authForm.address}
              onChange={(e) =>
                setAuthForm({ ...authForm, address: e.target.value })
              }
              required
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={authForm.email}
          onChange={(e) =>
            setAuthForm({ ...authForm, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={(e) =>
            setAuthForm({ ...authForm, password: e.target.value })
          }
          required
        />

        {authMode === "register" && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={authForm.password_confirmation}
            onChange={(e) =>
              setAuthForm({
                ...authForm,
                password_confirmation: e.target.value,
              })
            }
            required
          />
        )}

        {authError && <p className="auth-error">{authError}</p>}

        <button
          type="submit"
          className="auth-submit"
          disabled={authLoading}
        >
          {authLoading
            ? "Please wait..."
            : authMode === "register"
            ? "Create Account"
            : "Log In"}
        </button>
      </form>

      <p className="auth-switch">
        {authMode === "register"
          ? "Already have an account?"
          : "Don't have an account?"}

        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === "register" ? "login" : "register");
            setAuthError("");
          }}
        >
          {authMode === "register" ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  </div>
)}

    <div className="store">
      <header className="store-header" id="home">
        <div className="header-top">
          <a
            href="#home"
            className="logo"
            onClick={showHome}
          >
            <img src="/logo.jpg" alt="4Xabuoya Logo" />
            <span>4Xabuoya</span>
          </a>

          <form
            className="search-bar"
            onSubmit={(event) => {
              event.preventDefault();
              openCategories(true);
            }}
          >
            <Search size={20} />

            <input
              type="search"
              placeholder="Search for delicious food..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

            <button type="submit" className="search-submit">
              Search
            </button>
          </form>

          <button
            type="button"
            className="cart-button"
            onClick={openCart}
            aria-label={`Cart, ${cartItemCount} items`}
          >
            <ShoppingCart size={21} />
            <span>Cart</span>
            <span className="cart-count">{cartItemCount}</span>
          </button>

          <button
            type="button"
            className="notification-button"
            aria-label={`Notifications, ${unreadCount} unread`}
            onClick={openNotifications}
          >
            <Bell size={21} />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

         {customer ? (
  <div className="account-menu-wrapper">
    <button
      type="button"
      className="account-avatar"
      onClick={() => setShowAccountMenu(!showAccountMenu)}
    >
      <UserRound size={22} />
    </button>

    {showAccountMenu && (
      <div className="account-dropdown">
        <h3>My Account</h3>
        <p><strong>Name:</strong> {customerName}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Contact:</strong> {customer.contact_number}</p>
        <p><strong>Address:</strong> {customerAddress}</p>

        <button
          type="button"
          onClick={handleLogout}
          className="account-logout"
        >
          Log Out
        </button>
      </div>
    )}
  </div>
) : (
  <button
    type="button"
    className="signup-button"
    onClick={() => navigate("/register")}
  >
    Sign Up
  </button>
)}
        </div>

        <nav className="navigation" aria-label="Main navigation">
          <a
            href="#home"
            className={isHomePage ? "active-link" : ""}
            onClick={showHome}
          >
            Home
          </a>

          <a
            href="#categories"
            className={showCategories ? "active-link" : ""}
            onClick={(event) => {
              event.preventDefault();
              openCategories();
            }}
          >
            All Categories
          </a>

          <a
            href="#coupons"
            className={showCoupons ? "active-link" : ""}
            onClick={openCoupons}
          >
            Coupons
          </a>

          <a
            href="#orders"
            className={showOrders ? "active-link" : ""}
            onClick={openOrders}
          >
            <ClipboardList size={15} /> Orders ({orders.length})
          </a>

          <a
            href="#wishlist"
            className={showWishlist ? "active-link" : ""}
            onClick={openWishlist}
          >
            <Heart size={15} /> Wishlist ({wishlist.length})
          </a>
        </nav>
      </header>

      <main>
        {/* HOME PAGE */}
        {isHomePage && (
          <>
            <section className="welcome-section">
              <div className="welcome-content">
                <span className="welcome-label">
                  WELCOME TO 4XABUOYA!
                </span>

                <h1>
                  Hungry? 4Xabuoya's got you!
                  <br />
                  Delicious food, delivered right to your doorstep.
                  Order now!
                </h1>

                <p>
                  Discover your favorite drinks, cakes, and meals
                  all in one place.
                </p>

                <button
                  type="button"
                  className="shop-button"
                  onClick={browseProducts}
                >
                  Explore Products
                </button>
              </div>
            </section>

            <section className="products-section" id="best-sellers">
              <div className="section-heading product-heading">
                <div>
                  <span className="eyebrow">
                    CUSTOMER FAVORITES
                  </span>
                  <h2>Best Sellers</h2>
                  <p>
                    Check out some of our most-loved products.
                  </p>
                </div>

                <span className="product-count">3 products</span>
              </div>

              {productsLoading ? (
  <p>Loading products...</p>
) : productsError ? (
  <p>{productsError}</p>
) : (
  renderProductCards(
    [...products]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 3)
  )
)}
            </section>
          </>
        )}

        {/* ALL CATEGORIES PAGE */}
        {showCategories && (
          <>
            <section className="category-section" id="categories">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    FIND YOUR FAVORITE
                  </span>
                  <h2>All Categories</h2>
                  <p>
                    Choose a category and find your cravings.
                  </p>
                </div>
              </div>

              <div className="category-list">
                <button
                  type="button"
                  className={
                    activeCategory === "All"
                      ? "category-button selected"
                      : "category-button"
                  }
                  onClick={() => chooseCategory("All")}
                >
                  All Products
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={
                      activeCategory === category
                        ? "category-button selected"
                        : "category-button"
                    }
                    onClick={() => chooseCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section className="products-section" id="products">
              <div className="section-heading product-heading">
                <div>
                  <span className="eyebrow">MADE FOR YOU</span>
                  <h2>
                    {activeCategory === "All"
                      ? "All Products"
                      : activeCategory}
                  </h2>
                  <p>
                    {activeCategory === "All"
                      ? "Discover something delicious today."
                      : `Explore our ${activeCategory.toLowerCase()} products.`}
                  </p>
                </div>

                <span className="product-count">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "product"
                    : "products"}
                </span>
              </div>

              {renderProductCards(filteredProducts)}
            </section>
          </>
        )}

        {/* WISHLIST PAGE */}
        {showWishlist && (
          <section className="products-section" id="wishlist">
            <div className="section-heading product-heading">
              <div>
                <span className="eyebrow">
                  YOUR SAVED FAVORITES
                </span>
                <h2>My Wishlist</h2>
                <p>Products you have saved for later.</p>
              </div>

              <span className="product-count">
                {displayedWishlist.length}{" "}
                {displayedWishlist.length === 1
                  ? "product"
                  : "products"}
              </span>
            </div>

            <button
              type="button"
              className="back-to-products"
              onClick={browseProducts}
            >
              ← Back to All Products
            </button>

            {renderProductCards(displayedWishlist)}
          </section>
        )}

        {/* COUPONS PAGE */}
        {showCoupons && (
          <section className="coupons-page" id="coupons">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  SPECIAL OFFERS FOR YOU
                </span>
                <h2>My Coupons</h2>
                <p>
                  Save more on your favorite food and drinks!
                </p>
              </div>

              <span className="product-count">
                {coupons.length} coupons
              </span>
            </div>

            <div className="coupon-grid">
              {coupons.map((coupon) => (
                <article className="coupon-card" key={coupon.id}>
                  <div className="coupon-discount">
                    <strong>{coupon.discount}</strong>
                    <span>{coupon.discountLabel}</span>
                  </div>

                  <div className="coupon-details">
                    
                    <h3>{coupon.title}</h3>

                    {coupon.maximumText && (
                      <p>{coupon.maximumText}</p>
                    )}

                    <p>
                      Minimum spend: {coupon.minimumText}
                    </p>

                    <small>{coupon.expiration}</small>
                    <button
  type="button"
  className="shop-button"
  onClick={() => handleUseCoupon(coupon)}
  disabled={coupon.code === "SAVE12"}
>
  {selectedCoupon?.code === coupon.code
    ? "Selected"
    : coupon.code === "SAVE12"
    ? "Expired"
    : "Use Coupon"}
</button>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="shop-button coupon-back-button"
              onClick={browseProducts}
            >
              ← Back to Products
            </button>
          </section>
        )}

        {/* NOTIFICATIONS PAGE */}
        {showNotifications && (
          <section className="account-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">STAY UPDATED</span>
                <h2>Notifications</h2>
                <p>Your order updates and recent activity.</p>
              </div>

              <button
                type="button"
                className="back-to-products"
                onClick={markAllNotificationsRead}
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={35} />
                <h3>No notifications yet</h3>
                <p>
                  Updates about your orders will appear here.
                </p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    className={`notification-item ${
                      notification.read ? "" : "unread"
                    }`}
                    onClick={() => openNotification(notification)}
                  >
                    <span className="notification-item-icon">
                      <Bell size={18} />
                    </span>

                    <span className="notification-item-content">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>
                        {notification.createdAt
                          ? new Date(
                              notification.createdAt
                            ).toLocaleString()
                          : ""}
                      </small>
                    </span>

                    {!notification.read && (
                      <span className="unread-dot" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        
        {/* CART PAGE */}
        {showCart && (
          <section className="account-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR SELECTIONS</span>
                <h2>My Cart</h2>
                <p>
                  Review your items before placing your order.
                </p>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={35} />
                <h3>Your cart is empty</h3>
                <p>
                  Add some delicious food and drinks to get started.
                </p>

                <button
                  type="button"
                  className="shop-button"
                  onClick={browseProducts}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <div className="order-item-list">
                  {cart.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.id
                    );

                    if (!product) return null;

                    return (
                      <article
                        className="order-item"
                        key={item.id}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                        />

                        <div className="order-item-info">
                          <h3>{product.name}</h3>

                          <p>
                            {formatPrice(product.price)} each
                          </p>

                          <div className="quantity-controls">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, -1)
                              }
                              aria-label={`Decrease ${product.name} quantity`}
                            >
                              −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, 1)
                              }
                              aria-label={`Increase ${product.name} quantity`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  }}
>
  <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  }}
>
  <strong>
    {formatPrice(product.price * item.quantity)}
  </strong>

  <button
    type="button"
    onClick={() => removeFromCart(item.id)}
    style={{
      color: "#d9534f",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
    }}
  >
    Remove
  </button>
</div>
</div>
                      </article>
                    );
                  })}
                </div>

                <div className="cart-summary">
  <span>Subtotal</span>
  <strong>{formatPrice(cartTotal)}</strong>
</div>

<div className="cart-summary">
  <span>Delivery Fee</span>
  <strong>{formatPrice(shippingFee)}</strong>
</div>

{selectedCoupon && (
  <div className="cart-summary">
    <div>
      <strong>{selectedCoupon.title}</strong>
      <p>Code: {selectedCoupon.code}</p>

      <button
        type="button"
        onClick={() => setSelectedCoupon(null)}
        style={{
          color: "#dc3545",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Remove Coupon
      </button>
    </div>

    <strong style={{ color: "green" }}>
      {couponEligible
        ? `-${formatPrice(couponDiscount)}`
        : "Not eligible"}
    </strong>
  </div>
)}

{selectedCoupon && !couponEligible && (
  <p style={{ color: "#dc3545" }}>
    Minimum spend is {formatPrice(
      couponMinimum[selectedCoupon.code]
    )}. Add more products to use this coupon.
  </p>
)}

<div className="cart-summary">
  <span>Grand Total</span>
  <strong>{formatPrice(finalCartTotal)}</strong>
</div>

                {/* CHECKOUT FORM */}
               {/* CHECKOUT DETAILS */}
<div className="checkout-details">
  <h3>Delivery Information</h3>

  {!customer ? (
    <p>Please log in to continue with checkout.</p>
  ) : (
    <div className="customer-checkout-info">
      <p>
        <strong>Customer Name:</strong> {customerName}
      </p>

      <p>
        <strong>Email:</strong> {customer.email}
      </p>

      <p>
        <strong>Contact Number:</strong>{" "}
        {customer.contact_number}
      </p>

      <p>
        <strong>Delivery Address:</strong>{" "}
        {customerAddress}
      </p>
    </div>
  )}

  <h3>Payment Method</h3>

  <select
    value={checkout.payment_method}
    onChange={(e) =>
      setCheckout({
        ...checkout,
        payment_method: e.target.value,
      })
    }
  >
    <option value="Cash on Delivery">
      Cash on Delivery
    </option>
  </select>

  {checkoutError && (
    <p style={{ color: "red" }}>{checkoutError}</p>
  )}

  <button
    type="button"
    className="shop-button"
    onClick={placeOrder}
    disabled={placingOrder || !customer}
  >
    {placingOrder ? "Placing Order..." : "Place Order"}
  </button>
</div>
              </>
            )}
          </section>
        )}

        
{/* ORDERS PAGE */}
{showOrders && (
  <section className="account-page" id="orders">
    <div className="section-heading">
      <div>
        <span className="eyebrow">Order History</span>
        <h2>My Orders</h2>
        <p>View the orders you have placed.</p>
      </div>

      <div className="order-filters">
        {[
  "All",
  "Pending",
  "Processing",
  "Packed",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
].map((status) => (
          <button
            key={status}
            type="button"
            className={activeOrderStatus === status ? "active" : ""}
            onClick={() => setActiveOrderStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>
    </div>

    {orders.length === 0 ? (
      <div className="empty-state">
        <ClipboardList size={35} />
        <h3>No orders yet</h3>
        <p>Your placed orders will appear here.</p>

        <button
          type="button"
          className="shop-button"
          onClick={browseProducts}
        >
          Browse Products
        </button>
      </div>
    ) : (
      <div className="orders-list">
        {orders
          .filter((order) => {
            if (activeOrderStatus === "All") return true;

            const status =
              order.order_status || order.status || "Pending";

            return (
              status.toLowerCase() === activeOrderStatus.toLowerCase()
            );
          })
          .map((order) => {
            const status =
              order.order_status || order.status || "Pending";

            const canCancel =
              ["Pending", "Processing"].includes(status);

            const isDatabaseOrder =
              order.id !== null &&
              order.id !== undefined &&
              /^\d+$/.test(String(order.id));

            const orderNumber =
              order.order_number ||
              (isDatabaseOrder
                ? `ORD-${String(order.id).padStart(6, "0")}`
                : order.id);

            return (
              <article className="order-card" key={order.id}>
                <div className="order-card-heading">
                  <div>
                    <span className="eyebrow">
                      ORDER NUMBER
                    </span>

                    <h3>{orderNumber}</h3>

                    <small>
                      {order.createdAt || order.created_at
                        ? new Date(
                            order.createdAt || order.created_at
                          ).toLocaleString()
                        : ""}
                    </small>
                  </div>

                  <span
                    className={`order-status ${
                      status.toLowerCase().replace(/\s+/g, "-")
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="order-card-items">
                  {(Array.isArray(order.items) ? order.items : []).map(
                    (item, index) => (
                      <div
                        key={`${order.id}-${item.id || index}`}
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>

                        <strong>
                          {formatPrice(
                            item.price * item.quantity
                          )}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                

<div className="order-price-breakdown">
  <div className="cart-summary">
    <span>Subtotal</span>
    <strong>
      {formatPrice(order.subtotal ?? order.total ?? 0)}
    </strong>
  </div>

  <div className="cart-summary">
    <span>Delivery Fee</span>
    <strong>
      {formatPrice(order.shipping_fee ?? 0)}
    </strong>
  </div>

  {order.coupon_code && (
    <div className="cart-summary">
      <span>Coupon ({order.coupon_code})</span>
      <strong style={{ color: "green" }}>
        -{formatPrice(order.discount_amount ?? 0)}
      </strong>
    </div>
  )}

  <div className="cart-summary">
    <span>Order Total</span>
    <strong>
      {formatPrice(
        order.total ??
        order.grand_total ??
        order.total_amount ??
        0
      )}
    </strong>
  </div>
</div>


                {canCancel && isDatabaseOrder && (
                  <div className="order-actions">
                    <button
                      type="button"
                      className="cancel-order-button"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </article>
            );
          })}
      </div>
    )}
  </section>
)}
</main>

{/* PRODUCT DETAILS AND REVIEWS MODAL */}
{selectedProduct && (
  <div className="product-modal-overlay">
    <div className="product-modal">
      <button
        type="button"
        className="product-modal-close"
        onClick={() => {
          setSelectedProduct(null);
          setProductReviews([]);
        }}
        aria-label="Close product details"
      >
        <X size={22} />
      </button>

      <div className="product-modal-content">
        <img
          src={selectedProduct.image}
          alt={selectedProduct.name}
          className="product-modal-image"
        />

        <div className="product-modal-info">
          <span className="product-category">
            {selectedProduct.category}
          </span>

          <h2>{selectedProduct.name}</h2>

          <p>{selectedProduct.description}</p>

          <h3 className="product-modal-price">
            {formatPrice(selectedProduct.price)}
          </h3>

          <div className="product-rating">
            <span>★</span>{" "}
            {selectedProduct.rating ?? "No rating yet"}
            <span className="rating-divider">|</span>
            {selectedProduct.sold} sold
          </div>

          <button
            type="button"
            className="add-to-cart"
            onClick={() => addToCart(selectedProduct)}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-reviews-section">
        <h3>Customer Reviews</h3>

{/* CUSTOMER REVIEW FORM */}
<form
  className="review-form"
  onSubmit={handleSubmitReview}
>
  <h4>Write a Review</h4>

  {!customer ? (
    <p>Please log in to submit a review.</p>
  ) : (
    <>
      <label>Rate this product:</label>

      <div className="review-star-selector">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewScore(star)}
            className={star <= reviewScore ? "selected" : ""}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="Share your experience with this product..."
        value={reviewComment}
        onChange={(e) => setReviewComment(e.target.value)}
        maxLength={1000}
      />

      <button
        type="submit"
        className="submit-review-button"
        disabled={reviewSubmitting}
      >
        {reviewSubmitting ? "Submitting..." : "Submit Review"}
      </button>

      <small>
        You can review a product only after its order is delivered.
        One review per product is allowed.
      </small>
    </>
  )}
</form>

        {reviewsLoading ? (
          <p>Loading reviews...</p>
        ) : productReviews.length === 0 ? (
          <p>No reviews yet for this product.</p>
        ) : (
          <div className="product-reviews-list">
            {productReviews.map((review) => (
              <div className="product-review-card" key={review.id}>
                <strong>
                  {review.customer
                    ? `${review.customer.first_name || ""} ${review.customer.last_name || ""}`.trim()
                    : "Customer"}
                </strong>

                <div className="review-stars">
                  {"★".repeat(Number(review.score))}
                  {"☆".repeat(5 - Number(review.score))}
                </div>

                <p>{review.comment || "No comment provided."}</p>

                <small>
                  {review.date
                    ? new Date(review.date).toLocaleDateString()
                    : ""}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {/* ADD-TO-CART MESSAGE */}
      {showCartMessage && (
        <div className="toast-message" role="status">
          <ShoppingCart size={18} />

          You have {cartItemCount} item
          {cartItemCount === 1 ? "" : "s"} in your cart.

          <button
            type="button"
            onClick={() => setShowCartMessage(false)}
            aria-label="Close message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* FOOTER */}
      <footer className="store-footer">
        <a
          href="#home"
          className="logo"
          onClick={showHome}
        >
          <img src="/logo.jpg" alt="4Xabuoya Logo" />
          <span>4Xabuoya</span>
        </a>

        <p>
          Delicious food, delivered right to your doorstep.
        </p>

        <small>© 2026 4Xabuoya. All rights reserved.</small>
      </footer>
          </div>
    </>
  );
}

export default App;
