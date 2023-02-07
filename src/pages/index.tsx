import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { filters, products } from "@src/data";
import { Product as ProductType } from "@src/types";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, Fragment, useState } from "react";
import { create } from "zustand";
import { useRouter } from "next/router";

const useProductStore = create<{
  cart: ProductType[];
  addProduct: (product: ProductType) => void;
  removeProduct: (index: number) => void;
}>((set) => ({
  cart: [],
  addProduct: (product) =>
    set((state) => ({
      cart: [...state.cart, product],
    })),
  removeProduct: (index) =>
    set((state) => ({
      cart: state.cart.filter((product, i) => {
        if (index !== i) return product;
      }),
    })),
}));

const useActiveFilterStore = create<{
  actives: string[];
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
}>((set) => ({
  actives: [],
  addFilter: (filter) =>
    set((state) => ({
      actives: [...state.actives, filter],
    })),
  removeFilter: (filter) =>
    set((state) => ({
      actives: state.actives.filter((f) => {
        if (filter !== f) return f;
      }),
    })),
}));

function Navbar() {
  return (
    <div className="p-4">
      <nav className="flex items-center justify-between" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="https://www.ktra99.dev/" className="-m-1.5 p-1.5">
            <span className="sr-only">Ktra99</span>
            <img className="h-6 w-6" src="/logo.png" alt="avatar" />
          </a>
        </div>
        <div className="flex flex-1 justify-end">
          <a
            href="https://github.com/ktra99/ecommerce"
            className="text-sm font-semibold leading-6 text-gray-900"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-500"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </nav>
    </div>
  );
}

function Product({ product }: { product: ProductType }) {
  const addProduct = useProductStore((state) => state.addProduct);
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.25,
          ease: "easeInOut",
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.25,
          ease: "easeInOut",
        },
      }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96">
        <img
          src={product.image}
          alt="Product image"
          className="h-full w-full object-cover object-center sm:h-full sm:w-full"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium text-gray-900">
          <button type="button">
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </button>
        </h3>
        <div className="flex flex-1 flex-col justify-end">
          <p className="text-base font-medium text-gray-900">
            {product.price} SEK
          </p>
        </div>
        <button
          type="button"
          onClick={() => addProduct(product)}
          className="relative mt-6 flex items-center justify-center rounded-md border border-transparent bg-black py-2 px-8 text-xs font-medium text-white hover:bg-slate-800 sm:text-base"
        >
          Add to cart
          <span className="sr-only">, {product.name}</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const cart = useProductStore((state) => state.cart);
  const removeProduct = useProductStore((state) => state.removeProduct);
  const actives = useActiveFilterStore((state) => state.actives);
  const addFilter = useActiveFilterStore((state) => state.addFilter);
  const removeFilter = useActiveFilterStore((state) => state.removeFilter);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const handleOnChange = (e: FormEvent<HTMLFormElement>) => {
    const target = e.target as typeof e.target & {
      value: string;
      checked: boolean;
    };
    if (target.checked) {
      addFilter(target.value);
    } else {
      removeFilter(target.value);
    }
  };
  const handleOnSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const stripe = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          line_items: cart.map((product) => ({
            quantity: 1,
            price: product.id,
          })),
        }),
      });
      const response = await stripe.json();
      push(response.url);
    } catch (e) {
      console.error("Error ", e);
    }
  };
  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <Dialog.Panel className="relative mt-8 w-full max-w-2xl transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all">
                  <div className="mx-auto my-6 w-12 rounded-xl border-2 border-gray-300"></div>
                  <form className="xs:p-4" onSubmit={handleOnSubmit}>
                    <section
                      aria-labelledby="cart-heading"
                      className="h-96 overflow-y-scroll "
                    >
                      <h2 id="cart-heading" className="sr-only">
                        Items in your shopping cart
                      </h2>

                      <ul
                        role="list"
                        className="divide-y divide-gray-200 border-t border-b border-gray-200"
                      >
                        <AnimatePresence>
                          {cart
                            .map((product, index) => (
                              <motion.li
                                layout
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: 1,
                                  transition: {
                                    duration: 0.25,
                                    ease: "easeInOut",
                                  },
                                }}
                                exit={{
                                  opacity: 0,
                                  transition: {
                                    duration: 0.25,
                                    ease: "easeInOut",
                                  },
                                }}
                                className="flex py-6"
                              >
                                <div className="flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt="Product image"
                                    className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                                  <div>
                                    <div className="flex justify-between">
                                      <h4 className="text-sm">
                                        <span className="font-medium text-gray-700 hover:text-gray-800">
                                          {product.name}
                                        </span>
                                      </h4>
                                      <p className="ml-4 text-sm font-medium text-gray-900">
                                        {product.price} SEK
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-1 items-end justify-between">
                                    <button
                                      type="button"
                                      onClick={() => removeProduct(index)}
                                      className="text-sm font-medium text-black"
                                    >
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.li>
                            ))
                            .reverse()}
                        </AnimatePresence>
                      </ul>
                    </section>
                    <section
                      aria-labelledby="summary-heading"
                      className="mt-10"
                    >
                      <h2 id="summary-heading" className="sr-only">
                        Order summary
                      </h2>

                      <div>
                        <dl className="space-y-4">
                          <div className="flex items-center justify-between">
                            <dt className="text-base font-medium text-gray-900">
                              Subtotal
                            </dt>
                            <dd className="ml-4 text-base font-medium text-gray-900">
                              {cart.reduce((acc, curr) => acc + curr.price, 0)}{" "}
                              SEK
                            </dd>
                          </div>
                        </dl>
                        <p className="mt-1 text-sm text-gray-500">
                          Shipping and taxes will be calculated at checkout.
                        </p>
                      </div>

                      <div className="mt-10">
                        <button
                          type="submit"
                          className={clsx(
                            !cart.length
                              ? "cursor-not-allowed bg-slate-400 hover:bg-slate-500"
                              : "bg-black hover:bg-slate-800",
                            "w-full rounded-md border border-transparent py-3 px-4 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-gray-50"
                          )}
                          disabled={!cart.length}
                        >
                          Checkout
                        </button>
                      </div>
                      <div className="mt-6 text-center text-sm">
                        <p>
                          or{" "}
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="font-medium text-black"
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </section>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <form className="mt-4" onChange={handleOnChange}>
                  {filters.map((section) => (
                    <Disclosure
                      as="div"
                      key={section.name}
                      className="border-t border-gray-200 pt-4 pb-4"
                    >
                      {({ open }) => (
                        <fieldset>
                          <legend className="w-full px-2">
                            <Disclosure.Button className="flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                              <span className="text-sm font-medium text-gray-900">
                                {section.name}
                              </span>
                              <span className="ml-6 flex h-7 items-center">
                                <ChevronDownIcon
                                  className={clsx(
                                    open ? "-rotate-180" : "rotate-0",
                                    "h-5 w-5 transform"
                                  )}
                                  aria-hidden="true"
                                />
                              </span>
                            </Disclosure.Button>
                          </legend>
                          <Disclosure.Panel className="px-4 pt-4 pb-2">
                            <div className="space-y-6">
                              {section.options.map((option, optionIdx) => (
                                <div
                                  key={option.value}
                                  className="flex items-center"
                                >
                                  <input
                                    id={`${section.id}-${optionIdx}-mobile`}
                                    name={`${section.id}[]`}
                                    defaultValue={option.value}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-slate-800 transition duration-300 focus:ring-slate-900"
                                    defaultChecked={actives.includes(
                                      option.value
                                    )}
                                  />
                                  <label
                                    htmlFor={`${section.id}-${optionIdx}-mobile`}
                                    className="ml-3 text-sm text-gray-500"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </fieldset>
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
        <div className="sticky top-0 z-10 flex justify-between border-b border-gray-200 bg-white pt-24 pb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              New Arrivals
            </h1>
            <p className="mt-4 hidden text-base text-gray-500 sm:block">
              Checkout out our latest collection!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center"
          >
            <ShoppingCartIcon className="h-7 w-7" />{" "}
            <AnimatePresence mode="wait">
              <motion.span
                className="w-7"
                key={cart.length}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.25,
                    ease: "easeOut",
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    duration: 0.25,
                    ease: "easeInOut",
                  },
                }}
              >
                {cart.length}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div className="pt-12 pb-24 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          <aside>
            <h2 className="sr-only">Filters</h2>

            <button
              type="button"
              className="inline-flex items-center lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="text-sm font-medium text-gray-700">Filters</span>
              <PlusIcon
                className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
            </button>

            <div className="hidden lg:block">
              <form
                className="space-y-10 divide-y divide-gray-200"
                onChange={handleOnChange}
              >
                {filters.map((section, sectionIdx) => (
                  <div
                    key={section.name}
                    className={clsx(sectionIdx !== 0 && "pt-10")}
                  >
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-900">
                        {section.name}
                      </legend>
                      <div className="space-y-3 pt-6">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`${section.id}-${optionIdx}`}
                              name={`${section.id}[]`}
                              defaultValue={option.value}
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-slate-800 transition duration-300 focus:ring-slate-900"
                              defaultChecked={actives.includes(option.value)}
                            />
                            <label
                              htmlFor={`${section.id}-${optionIdx}`}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ))}
              </form>
            </div>
          </aside>

          <section
            aria-labelledby="product-heading"
            className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
          >
            <h2 id="product-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
              {actives.length ? (
                <AnimatePresence>
                  {products
                    .filter(
                      (product) =>
                        actives.includes(product.color) ||
                        actives.some((size) => product.sizes.includes(size))
                    )
                    .map((product, index) => (
                      <Product key={index} product={product} />
                    ))}
                </AnimatePresence>
              ) : (
                <>
                  {products.map((product, index) => (
                    <Product key={index} product={product} />
                  ))}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
