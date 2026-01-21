(function () {
    function qs(id) {
        return document.getElementById(id);
    }

    const modalOverlay = qs('product-modal');
    const modalTitle = qs('modal-title');
    const modalPrice = qs('modal-price');
    const modalImage = qs('modal-image');
    const modalDesc = qs('modal-desc');
    const modalFeatures = qs('modal-features');
    const modalClose = qs('modal-close');
    const modalClose2 = qs('modal-close-2');
    const modalAdd = qs('modal-add');

    const productsGrid = document.querySelector('.products');
    const productPage = qs('product-page');
    const pageTitle = qs('page-title');
    const pagePrice = qs('page-price');
    const pageImage = qs('page-image');
    const pageDesc = qs('page-desc');
    const pageFeatures = qs('page-features');
    const backToShop = qs('back-to-shop');
    const buyNow = qs('buy-now');
    const buyMessage = qs('buy-message');
    const pageQty = qs('page-qty');
    const pageAddToCart = qs('page-add-to-cart');

    const openCartBtn = qs('open-cart');
    const cartOverlay = qs('cart-overlay');
    const cartDrawer = qs('cart-drawer');
    const closeCartBtn = qs('close-cart');
    const cartItemsEl = qs('cart-items');
    const cartCountEl = qs('cart-count');
    const cartTotalEl = qs('cart-total');
    const checkoutBtn = qs('checkout');

    const productSearch = qs('product-search');
    const searchClear = qs('search-clear');

    const resultsCount = qs('results-count');
    const sortBy = qs('sort-by');
    const categoryRow = qs('category-row');
    const toastContainer = qs('toast-container');

    const adminToggle = qs('admin-toggle');
    const adminPanel = qs('admin-panel');
    const adminClose = qs('admin-close');
    const adminCancel = qs('admin-cancel');
    const adminForm = qs('admin-form');
    const adminItemsList = qs('admin-items-list');

    const adminName = qs('admin-name');
    const adminPrice = qs('admin-price');
    const adminDesc = qs('admin-desc');
    const adminFeatures = qs('admin-features');
    const adminImage = qs('admin-image');

    const signinButton = qs('signin-button');
    const userProfile = qs('user-profile');
    const userAvatar = qs('user-avatar');
    const userName = qs('user-name');
    const signOutButton = qs('sign-out');

    let selectedCategory = 'all';

    const CART_KEY = 'techshop_cart';
    const ADMIN_ITEMS_KEY = 'techshop_admin_items';
    const USER_KEY = 'techshop_user';
    let cart = [];
    let adminItems = [];
    let editingIndex = -1;
    let currentUser = null;

    let currentProductData = null;

    if (!modalOverlay) {
        return;
    }

    function openModalFromProduct(productEl) {
        const name = productEl.dataset.name || '';
        const price = productEl.dataset.price || '';
        const desc = productEl.dataset.desc || '';
        const features = productEl.dataset.features || '';
        const image = productEl.dataset.image || '';

        currentProductData = {
            name: name,
            price: price,
            desc: desc,
            features: features,
            image: image
        };

        modalOverlay.dataset.name = name;
        modalOverlay.dataset.price = price;
        modalOverlay.dataset.desc = desc;
        modalOverlay.dataset.features = features;
        modalOverlay.dataset.image = image;

        modalTitle.textContent = name;
        modalPrice.textContent = price;
        modalDesc.textContent = desc;

        modalImage.src = image;
        modalImage.alt = name;

        while (modalFeatures.firstChild) {
            modalFeatures.removeChild(modalFeatures.firstChild);
        }

        features
            .split('|')
            .map(function (f) { return f.trim(); })
            .filter(Boolean)
            .forEach(function (f) {
                const li = document.createElement('li');
                li.textContent = f;
                modalFeatures.appendChild(li);
            });

        modalOverlay.classList.add('open');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        modalClose.focus();
    }

    function parsePrice(priceStr) {
        const n = Number(String(priceStr || '').replace(/[^0-9.]/g, ''));
        return Number.isFinite(n) ? n : 0;
    }

    function formatMoney(n) {
        return '$' + Number(n || 0).toFixed(2);
    }

    function showToast(message) {
        if (!toastContainer) {
            return;
        }
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = message;
        toastContainer.appendChild(t);

        setTimeout(function () {
            if (t && t.parentNode) {
                t.parentNode.removeChild(t);
            }
        }, 2400);
    }

    function inferCategoryFromName(name) {
        const n = String(name || '').toLowerCase();
        if (n.indexOf('headphone') !== -1 || n.indexOf('earbud') !== -1 || n.indexOf('speaker') !== -1) {
            return 'audio';
        }
        if (n.indexOf('macbook') !== -1 || n.indexOf('keyboard') !== -1 || n.indexOf('monitor') !== -1 || n.indexOf('hub') !== -1) {
            return 'computers';
        }
        if (n.indexOf('galaxy') !== -1 || n.indexOf('phone') !== -1) {
            return 'mobile';
        }
        if (n.indexOf('thermostat') !== -1 || n.indexOf('smart') !== -1 || n.indexOf('bulb') !== -1 || n.indexOf('router') !== -1) {
            return 'smart-home';
        }
        if (n.indexOf('mouse') !== -1 || n.indexOf('charger') !== -1) {
            return 'accessories';
        }
        if (n.indexOf('vr') !== -1 || n.indexOf('gaming') !== -1 || n.indexOf('keyboard') !== -1 || n.indexOf('mouse') !== -1) {
            return 'gaming';
        }
        if (n.indexOf('chair') !== -1) {
            return 'office';
        }
        if (n.indexOf('gopro') !== -1 || n.indexOf('camera') !== -1 || n.indexOf('drone') !== -1) {
            return 'cameras';
        }
        if (n.indexOf('ssd') !== -1) {
            return 'storage';
        }
        if (n.indexOf('router') !== -1 || n.indexOf('wi') !== -1) {
            return 'networking';
        }
        return 'accessories';
    }

    function prettifyCategory(cat) {
        const c = String(cat || '').toLowerCase();
        if (c === 'smart-home') return 'Smart Home';
        if (c === 'computers') return 'Computers';
        if (c === 'mobile') return 'Mobile';
        if (c === 'accessories') return 'Accessories';
        if (c === 'gaming') return 'Gaming';
        if (c === 'office') return 'Office';
        if (c === 'cameras') return 'Cameras';
        if (c === 'storage') return 'Storage';
        if (c === 'networking') return 'Networking';
        if (c === 'audio') return 'Audio';
        return c;
    }

    function ensureBadges(productEl) {
        if (productEl.querySelector('.badges')) {
            return;
        }

        const name = productEl.dataset.name || '';
        if (!productEl.dataset.category) {
            productEl.dataset.category = inferCategoryFromName(name);
        }

        const badges = document.createElement('div');
        badges.className = 'badges';

        const price = document.createElement('span');
        price.className = 'badge price';
        price.textContent = productEl.dataset.price || '';

        const cat = document.createElement('span');
        cat.className = 'badge';
        cat.textContent = prettifyCategory(productEl.dataset.category);

        badges.appendChild(price);
        badges.appendChild(cat);
        productEl.insertBefore(badges, productEl.firstChild);
    }

    function loadCurrentUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            currentUser = raw ? JSON.parse(raw) : null;
        } catch (e) {
            currentUser = null;
        }
    }

    function saveCurrentUser(user) {
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {
        }
    }

    function updateAuthUI() {
        if (!signinButton || !userProfile || !adminToggle) {
            return;
        }

        if (currentUser) {
            signinButton.style.display = 'none';
            userProfile.style.display = 'flex';
            
            if (userAvatar) userAvatar.src = currentUser.picture || '';
            if (userName) userName.textContent = currentUser.name || 'User';
            
            if (adminToggle) {
                adminToggle.style.display = 'inline-flex';
            }
        } else {
            signinButton.style.display = 'block';
            userProfile.style.display = 'none';
            
            if (adminToggle) {
                adminToggle.style.display = 'none';
            }
        }
    }

    function handleSignIn(response) {
        const payload = response.credential;
        const decoded = JSON.parse(atob(payload.split('.')[1]));
        
        currentUser = {
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
            sub: decoded.sub
        };
        
        saveCurrentUser(currentUser);
        updateAuthUI();
        showToast('Welcome, ' + currentUser.name + '!');
    }

    function signOut() {
        currentUser = null;
        localStorage.removeItem(USER_KEY);
        updateAuthUI();
        closeAdminPanel();
        showToast('Signed out successfully');
    }

    function requireAuth() {
        if (!currentUser) {
            showToast('Please sign in to access admin features');
            return false;
        }
        return true;
    }

    function loadAdminItems() {
        try {
            const raw = localStorage.getItem(ADMIN_ITEMS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            adminItems = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            adminItems = [];
        }
    }

    function saveAdminItems() {
        try {
            localStorage.setItem(ADMIN_ITEMS_KEY, JSON.stringify(adminItems));
        } catch (e) {
        }
    }

    function renderAdminItems() {
        if (!adminItemsList) {
            return;
        }

        adminItemsList.innerHTML = '';

        if (!adminItems.length) {
            const empty = document.createElement('div');
            empty.className = 'cart-empty';
            empty.textContent = 'No admin items added yet.';
            adminItemsList.appendChild(empty);
            return;
        }

        adminItems.forEach(function (item, index) {
            const card = document.createElement('div');
            card.className = 'admin-item-card';

            const info = document.createElement('div');
            info.className = 'admin-item-info';

            const name = document.createElement('div');
            name.className = 'admin-item-name';
            name.textContent = item.name || '';

            const price = document.createElement('div');
            price.className = 'admin-item-price';
            price.textContent = item.price || '';

            info.appendChild(name);
            info.appendChild(price);

            const actions = document.createElement('div');
            actions.className = 'admin-item-actions';

            const edit = document.createElement('button');
            edit.className = 'admin-edit';
            edit.type = 'button';
            edit.textContent = 'Edit';
            edit.addEventListener('click', function () {
                editAdminItem(index);
            });

            const del = document.createElement('button');
            del.className = 'admin-delete';
            del.type = 'button';
            del.textContent = 'Delete';
            del.addEventListener('click', function () {
                deleteAdminItem(index);
            });

            actions.appendChild(edit);
            actions.appendChild(del);

            card.appendChild(info);
            card.appendChild(actions);

            adminItemsList.appendChild(card);
        });
    }

    function openAdminPanel() {
        if (!requireAuth()) {
            return;
        }
        if (!adminPanel) {
            return;
        }
        adminPanel.hidden = false;
        renderAdminItems();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeAdminPanel() {
        if (!adminPanel) {
            return;
        }
        adminPanel.hidden = true;
        clearAdminForm();
        editingIndex = -1;
    }

    function clearAdminForm() {
        if (adminForm) {
            adminForm.reset();
        }
    }

    function editAdminItem(index) {
        const item = adminItems[index];
        if (!item) {
            return;
        }

        editingIndex = index;

        if (adminName) adminName.value = item.name || '';
        if (adminPrice) adminPrice.value = item.price || '';
        if (adminDesc) adminDesc.value = item.desc || '';
        if (adminFeatures) adminFeatures.value = item.features || '';
        if (adminImage) adminImage.value = item.image || '';

        if (adminForm) {
            const submitBtn = adminForm.querySelector('.admin-submit');
            if (submitBtn) {
                submitBtn.textContent = 'Update Item';
            }
        }
    }

    function deleteAdminItem(index) {
        if (confirm('Are you sure you want to delete this item?')) {
            adminItems.splice(index, 1);
            saveAdminItems();
            renderAdminItems();
            renderProducts();
            showToast('Item deleted successfully');
        }
    }

    function addAdminItem(itemData) {
        adminItems.push(itemData);
        saveAdminItems();
        renderAdminItems();
        renderProducts();
        showToast('Item added successfully');
    }

    function updateAdminItem(index, itemData) {
        adminItems[index] = itemData;
        saveAdminItems();
        renderAdminItems();
        renderProducts();
        showToast('Item updated successfully');
    }

    function renderProducts() {
        if (!productsGrid) {
            return;
        }

        const existingProducts = productsGrid.querySelectorAll('.product[data-admin-item]');
        existingProducts.forEach(function (product) {
            product.remove();
        });

        adminItems.forEach(function (item) {
            const productEl = document.createElement('div');
            productEl.className = 'product';
            productEl.dataset.adminItem = 'true';
            productEl.dataset.name = item.name || '';
            productEl.dataset.price = item.price || '';
            productEl.dataset.desc = item.desc || '';
            productEl.dataset.features = item.features || '';
            productEl.dataset.image = item.image || '';

            const imageUrl = item.image || 'https://picsum.photos/seed/' + encodeURIComponent(item.name || 'product') + '/600/600.jpg';
            const thumbUrl = item.image || 'https://picsum.photos/seed/' + encodeURIComponent(item.name || 'product') + '/300/300.jpg';

            productEl.innerHTML = '<a href="' + imageUrl + '"><img src="' + thumbUrl + '" alt="' + (item.name || '') + '"></a>' +
                '<h3>' + (item.name || '') + '</h3>' +
                '<p>' + (item.desc || '') + '</p>' +
                '<button>Add to Cart</button>';

            productsGrid.appendChild(productEl);

            productEl.addEventListener('click', function (e) {
                const button = e.target.closest('button');
                if (button) {
                    return;
                }

                const link = e.target.closest('a');
                if (link) {
                    e.preventDefault();
                }

                openModalFromProduct(productEl);
            });

            const addButton = productEl.querySelector('button');
            if (addButton) {
                addButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openProductPageFromProduct(productEl);
                });
            }
        });

        applyProductSearch();
    }

    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            cart = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            cart = [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
        }
    }

    function getCartCount() {
        return cart.reduce(function (sum, item) { return sum + (item.qty || 0); }, 0);
    }

    function getCartTotal() {
        return cart.reduce(function (sum, item) { return sum + (item.price || 0) * (item.qty || 0); }, 0);
    }

    function renderCart() {
        if (cartCountEl) {
            cartCountEl.textContent = String(getCartCount());
        }

        if (cartTotalEl) {
            cartTotalEl.textContent = formatMoney(getCartTotal());
        }

        if (!cartItemsEl) {
            return;
        }

        cartItemsEl.innerHTML = '';

        if (!cart.length) {
            const empty = document.createElement('div');
            empty.className = 'cart-empty';
            empty.textContent = 'Your cart is empty. Add items from the product page.';
            cartItemsEl.appendChild(empty);
            return;
        }

        cart.forEach(function (item) {
            const row = document.createElement('div');
            row.className = 'cart-item';

            const img = document.createElement('img');
            img.src = item.image || '';
            img.alt = item.name || '';

            const info = document.createElement('div');
            const name = document.createElement('div');
            name.className = 'cart-item-name';
            name.textContent = item.name || '';

            const sub = document.createElement('div');
            sub.className = 'cart-item-sub';
            sub.textContent = formatMoney(item.price) + ' each';

            info.appendChild(name);
            info.appendChild(sub);

            const actions = document.createElement('div');
            actions.className = 'cart-item-actions';

            const qty = document.createElement('input');
            qty.className = 'cart-qty';
            qty.type = 'number';
            qty.min = '1';
            qty.value = String(item.qty || 1);
            qty.addEventListener('change', function () {
                const next = Math.max(1, Number(qty.value || 1));
                qty.value = String(next);
                updateCartQty(item.name, next);
            });

            const remove = document.createElement('button');
            remove.className = 'cart-remove';
            remove.type = 'button';
            remove.textContent = 'Remove';
            remove.addEventListener('click', function () {
                removeFromCart(item.name);
            });

            actions.appendChild(qty);
            actions.appendChild(remove);

            row.appendChild(img);
            row.appendChild(info);
            row.appendChild(actions);

            cartItemsEl.appendChild(row);
        });
    }

    function openCart() {
        if (!cartOverlay || !cartDrawer) {
            return;
        }
        cartOverlay.classList.add('open');
        cartDrawer.classList.add('open');
        cartOverlay.setAttribute('aria-hidden', 'false');
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cart-open');
    }

    function closeCart() {
        if (!cartOverlay || !cartDrawer) {
            return;
        }
        cartOverlay.classList.remove('open');
        cartDrawer.classList.remove('open');
        cartOverlay.setAttribute('aria-hidden', 'true');
        cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cart-open');
    }

    function addToCart(data, qty) {
        const name = String((data && data.name) || '').trim();
        if (!name) {
            return;
        }

        const unitPrice = parsePrice((data && data.price) || '');
        const image = (data && data.image) || '';
        const q = Math.max(1, Number(qty || 1));

        const existing = cart.find(function (x) { return x.name === name; });
        if (existing) {
            existing.qty = Math.max(1, (existing.qty || 0) + q);
        } else {
            cart.push({ name: name, price: unitPrice, qty: q, image: image });
        }

        saveCart();
        renderCart();
        showToast('Added to cart: ' + name);
    }

    function removeFromCart(name) {
        cart = cart.filter(function (x) { return x.name !== name; });
        saveCart();
        renderCart();
    }

    function updateCartQty(name, qty) {
        const item = cart.find(function (x) { return x.name === name; });
        if (!item) {
            return;
        }
        item.qty = Math.max(1, Number(qty || 1));
        saveCart();
        renderCart();
    }

    function openProductPageFromData(data) {
        if (!productsGrid || !productPage) {
            return;
        }

        if (buyMessage) {
            buyMessage.style.display = 'none';
        }

        if (pageQty) {
            pageQty.value = '1';
        }

        pageTitle.textContent = data.name || '';
        pagePrice.textContent = data.price || '';
        pageDesc.textContent = data.desc || '';

        pageImage.src = data.image || '';
        pageImage.alt = data.name || '';

        while (pageFeatures.firstChild) {
            pageFeatures.removeChild(pageFeatures.firstChild);
        }

        (data.features || '')
            .split('|')
            .map(function (f) { return f.trim(); })
            .filter(Boolean)
            .forEach(function (f) {
                const li = document.createElement('li');
                li.textContent = f;
                pageFeatures.appendChild(li);
            });

        closeModal();
        productsGrid.hidden = true;
        productPage.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openProductPageFromProduct(productEl) {
        openProductPageFromData({
            name: productEl.dataset.name || '',
            price: productEl.dataset.price || '',
            desc: productEl.dataset.desc || '',
            features: productEl.dataset.features || '',
            image: productEl.dataset.image || ''
        });
    }

    function backToShopView() {
        if (!productsGrid || !productPage) {
            return;
        }
        productPage.hidden = true;
        productsGrid.hidden = false;
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function applyProductSearch() {
        const q = String((productSearch && productSearch.value) || '').trim().toLowerCase();
        const sort = (sortBy && sortBy.value) || 'relevance';

        const items = Array.prototype.slice.call(document.querySelectorAll('.product'));
        items.forEach(ensureBadges);

        const filtered = items.filter(function (p) {
            const haystack = (
                (p.dataset.name || '') + ' ' +
                (p.dataset.desc || '') + ' ' +
                (p.dataset.features || '')
            ).toLowerCase();

            const matchText = !q || haystack.indexOf(q) !== -1;
            const cat = (p.dataset.category || '').toLowerCase();
            const matchCat = selectedCategory === 'all' || cat === selectedCategory;
            const match = matchText && matchCat;
            p.style.display = match ? '' : 'none';
            return match;
        });

        function byPriceAsc(a, b) { return parsePrice(a.dataset.price) - parsePrice(b.dataset.price); }
        function byPriceDesc(a, b) { return parsePrice(b.dataset.price) - parsePrice(a.dataset.price); }
        function byNameAsc(a, b) { return String(a.dataset.name || '').localeCompare(String(b.dataset.name || '')); }

        if (productsGrid) {
            let ordered = items;
            if (sort === 'price-asc') {
                ordered = items.slice().sort(byPriceAsc);
            } else if (sort === 'price-desc') {
                ordered = items.slice().sort(byPriceDesc);
            } else if (sort === 'name-asc') {
                ordered = items.slice().sort(byNameAsc);
            }
            ordered.forEach(function (el) {
                productsGrid.appendChild(el);
            });
        }

        if (resultsCount) {
            resultsCount.textContent = 'Showing ' + String(filtered.length) + ' item(s)';
        }
    }

    if (adminToggle) {
        adminToggle.addEventListener('click', openAdminPanel);
    }

    if (adminClose) {
        adminClose.addEventListener('click', closeAdminPanel);
    }

    if (adminCancel) {
        adminCancel.addEventListener('click', closeAdminPanel);
    }

    if (signOutButton) {
        signOutButton.addEventListener('click', signOut);
    }

    if (adminForm) {
        adminForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const itemData = {
                name: adminName ? adminName.value.trim() : '',
                price: adminPrice ? adminPrice.value.trim() : '',
                desc: adminDesc ? adminDesc.value.trim() : '',
                features: adminFeatures ? adminFeatures.value.trim() : '',
                image: adminImage ? adminImage.value.trim() : ''
            };

            if (!itemData.name || !itemData.price || !itemData.desc || !itemData.features) {
                showToast('Please fill in all required fields');
                return;
            }

            if (editingIndex >= 0) {
                updateAdminItem(editingIndex, itemData);
            } else {
                addAdminItem(itemData);
            }

            clearAdminForm();
            editingIndex = -1;

            const submitBtn = adminForm.querySelector('.admin-submit');
            if (submitBtn) {
                submitBtn.textContent = 'Add Item';
            }
        });
    }

    document.querySelectorAll('.product').forEach(function (productEl) {
        productEl.addEventListener('click', function (e) {
            const button = e.target.closest('button');
            if (button) {
                return;
            }

            const link = e.target.closest('a');
            if (link) {
                e.preventDefault();
            }

            openModalFromProduct(productEl);
        });

        const addButton = productEl.querySelector('button');
        if (addButton) {
            addButton.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openProductPageFromProduct(productEl);
            });
        }
    });

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    modalClose.addEventListener('click', closeModal);
    modalClose2.addEventListener('click', closeModal);
    modalAdd.addEventListener('click', function () {
        const data = {
            name: modalOverlay.dataset.name || '',
            price: modalOverlay.dataset.price || '',
            desc: modalOverlay.dataset.desc || '',
            features: modalOverlay.dataset.features || '',
            image: modalOverlay.dataset.image || ''
        };
        currentProductData = data;
        openProductPageFromData(data);
    });

    if (backToShop) {
        backToShop.addEventListener('click', backToShopView);
    }

    if (buyNow) {
        buyNow.addEventListener('click', function () {
            if (buyMessage) {
                buyMessage.style.display = 'block';
            }
            openCart();
        });
    }

    if (pageAddToCart) {
        pageAddToCart.addEventListener('click', function () {
            if (!currentProductData) {
                currentProductData = {
                    name: pageTitle ? pageTitle.textContent : '',
                    price: pagePrice ? pagePrice.textContent : '',
                    desc: pageDesc ? pageDesc.textContent : '',
                    features: '',
                    image: pageImage ? pageImage.src : ''
                };
            }
            const qty = pageQty ? Number(pageQty.value || 1) : 1;
            addToCart(currentProductData, qty);
            openCart();
        });
    }

    if (openCartBtn) {
        openCartBtn.addEventListener('click', function () {
            renderCart();
            openCart();
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            if (buyMessage) {
                buyMessage.style.display = 'block';
            }
            cart = [];
            saveCart();
            renderCart();
            showToast('Checkout complete (demo).');
        });
    }

    if (productSearch) {
        productSearch.addEventListener('input', applyProductSearch);
    }

    if (searchClear) {
        searchClear.addEventListener('click', function () {
            if (!productSearch) {
                return;
            }
            productSearch.value = '';
            applyProductSearch();
            productSearch.focus();
        });
    }

    if (sortBy) {
        sortBy.addEventListener('change', applyProductSearch);
    }

    if (categoryRow) {
        categoryRow.addEventListener('click', function (e) {
            const chip = e.target.closest('.chip');
            if (!chip) {
                return;
            }
            selectedCategory = chip.dataset.category || 'all';
            categoryRow.querySelectorAll('.chip').forEach(function (c) {
                c.classList.toggle('active', c === chip);
            });
            applyProductSearch();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
        if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) {
            closeCart();
        }
    });

    loadCart();
    loadAdminItems();
    loadCurrentUser();
    renderCart();
    renderProducts();
    updateAuthUI();
    applyProductSearch();
})();

window.handleSignIn = function(response) {
    const payload = response.credential;
    const decoded = JSON.parse(atob(payload.split('.')[1]));
    
    const currentUser = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        sub: decoded.sub
    };
    
    localStorage.setItem('techshop_user', JSON.stringify(currentUser));
    
    const userProfile = document.getElementById('user-profile');
    const signinButton = document.getElementById('signin-button');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const adminToggle = document.getElementById('admin-toggle');
    
    if (signinButton) signinButton.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (userAvatar) userAvatar.src = currentUser.picture || '';
    if (userName) userName.textContent = currentUser.name || 'User';
    if (adminToggle) adminToggle.style.display = 'inline-flex';
    
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = 'Welcome, ' + currentUser.name + '!';
        toastContainer.appendChild(toast);
        setTimeout(function () {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 2400);
    }
};
