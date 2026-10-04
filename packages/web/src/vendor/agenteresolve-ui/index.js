/**
 * Vendored ESM build of @agenteresolve/ui@0.1.0 (main @ 03587e4), generated from the
 * upstream source. The published git package ships a broken dist/index.js that
 * re-exports .ts/.tsx sources which are not included in the tarball, so a
 * consumer bundler cannot resolve it. Only the JS is vendored; the design
 * tokens come from "@agenteresolve/ui/styles.css" (the git dependency).
 *
 * Regenerate with vite.bundle.config.ts in the upstream repo (external predicate
 * must only externalize bare specifiers). See dev-docs/shared-shell.md.
 */
import { clsx as e } from "clsx";
import { twMerge as t } from "tailwind-merge";
import * as n from "react";
import * as r from "@radix-ui/react-accordion";
import { ChevronDown as i, LogIn as a, Menu as o, UserRound as s, X as c } from "lucide-react";
import { Fragment as l, jsx as u, jsxs as d } from "react/jsx-runtime";
import * as f from "@radix-ui/react-avatar";
import { Slot as p } from "@radix-ui/react-slot";
import { cva as m } from "class-variance-authority";
import * as h from "@radix-ui/react-label";
import * as g from "@radix-ui/react-separator";
import * as _ from "@radix-ui/react-dialog";
import { AnimatePresence as ee, motion as v } from "motion/react";
import * as y from "@radix-ui/react-tooltip";
import { ClerkProvider as te, UserButton as ne, useClerk as re } from "@clerk/clerk-react";
//#region src/lib/cn.ts
function b(...n) {
	return t(e(n));
}
//#endregion
//#region src/lib/clerk.ts
var x = "VITE_CLERK_PUBLISHABLE_KEY";
function S(e) {
	if (e && e.trim()) return e.trim();
	try {
		let e = import.meta.env?.[x];
		if (e && e.trim()) return e.trim();
	} catch {}
}
var C = n.createContext(!1);
function w() {
	return n.useContext(C);
}
//#endregion
//#region src/components/ui/accordion.tsx
function ie(e) {
	return /* @__PURE__ */ u(r.Root, {
		"data-slot": "accordion",
		...e
	});
}
function ae({ className: e, ...t }) {
	return /* @__PURE__ */ u(r.Item, {
		"data-slot": "accordion-item",
		className: b("border-b border-border last:border-b-0", e),
		...t
	});
}
function oe({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ u(r.Header, {
		className: "flex",
		children: /* @__PURE__ */ d(r.Trigger, {
			"data-slot": "accordion-trigger",
			className: b("flex flex-1 items-center justify-between py-4 text-left text-sm font-medium text-foreground transition-all hover:text-brand [&[data-state=open]>svg]:rotate-180", e),
			...n,
			children: [t, /* @__PURE__ */ u(i, { className: "size-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
		})
	});
}
function se({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ u(r.Content, {
		"data-slot": "accordion-content",
		className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
		...n,
		children: /* @__PURE__ */ u("div", {
			className: b("pb-4 pt-0 text-muted-foreground", e),
			children: t
		})
	});
}
//#endregion
//#region src/components/ui/avatar.tsx
function ce({ className: e, ...t }) {
	return /* @__PURE__ */ u(f.Root, {
		"data-slot": "avatar",
		className: b("relative flex size-9 shrink-0 overflow-hidden rounded-full", e),
		...t
	});
}
function le({ className: e, ...t }) {
	return /* @__PURE__ */ u(f.Image, {
		"data-slot": "avatar-image",
		className: b("aspect-square size-full object-cover", e),
		...t
	});
}
function ue({ className: e, ...t }) {
	return /* @__PURE__ */ u(f.Fallback, {
		"data-slot": "avatar-fallback",
		className: b("flex size-full items-center justify-center rounded-full bg-surface-strong text-xs font-medium text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/components/ui/badge.tsx
var T = m("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&_svg]:size-3 [&_svg]:shrink-0", {
	variants: { variant: {
		default: "border-transparent bg-brand text-brand-foreground",
		secondary: "border-transparent bg-surface-strong text-foreground",
		outline: "border-border text-foreground",
		destructive: "border-transparent bg-destructive text-destructive-foreground",
		brand: "border-transparent bg-brand-gradient text-brand-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function de({ className: e, variant: t, asChild: n = !1, ...r }) {
	return /* @__PURE__ */ u(n ? p : "span", {
		"data-slot": "badge",
		className: b(T({ variant: t }), e),
		...r
	});
}
//#endregion
//#region src/components/ui/button.tsx
var E = m("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
			secondary: "bg-surface-strong text-foreground hover:bg-white/15",
			outline: "border border-border bg-transparent text-foreground hover:bg-surface",
			ghost: "text-foreground hover:bg-surface",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			link: "text-brand underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-11 rounded-xl px-6 text-base",
			icon: "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function D({ className: e, variant: t, size: n, asChild: r = !1, ...i }) {
	return /* @__PURE__ */ u(r ? p : "button", {
		"data-slot": "button",
		className: b(E({
			variant: t,
			size: n
		}), e),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
function O({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card",
		className: b("flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm backdrop-blur-sm", e),
		...t
	});
}
function k({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card-header",
		className: b("flex flex-col gap-1.5", e),
		...t
	});
}
function A({ className: e, ...t }) {
	return /* @__PURE__ */ u("h3", {
		"data-slot": "card-title",
		className: b("text-lg font-semibold leading-none tracking-tight", e),
		...t
	});
}
function j({ className: e, ...t }) {
	return /* @__PURE__ */ u("p", {
		"data-slot": "card-description",
		className: b("text-sm text-muted-foreground", e),
		...t
	});
}
function M({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card-content",
		className: b("", e),
		...t
	});
}
function N({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card-footer",
		className: b("flex items-center gap-2", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function P({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ u("input", {
		type: t,
		"data-slot": "input",
		className: b("flex h-9 w-full rounded-lg border border-input bg-surface px-3 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function F({ className: e, ...t }) {
	return /* @__PURE__ */ u(h.Root, {
		"data-slot": "label",
		className: b("text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70", e),
		...t
	});
}
//#endregion
//#region src/components/ui/separator.tsx
function I({ className: e, orientation: t = "horizontal", decorative: n = !0, ...r }) {
	return /* @__PURE__ */ u(g.Root, {
		"data-slot": "separator",
		decorative: n,
		orientation: t,
		className: b("shrink-0 bg-border", t === "horizontal" ? "h-px w-full" : "h-full w-px", e),
		...r
	});
}
//#endregion
//#region src/components/ui/sheet.tsx
var L = n.createContext({ open: !1 });
function R({ open: e, defaultOpen: t, onOpenChange: r, children: i, ...a }) {
	let [o, s] = n.useState(t ?? !1), c = e !== void 0, l = c ? e : o, d = n.useCallback((e) => {
		c || s(e), r?.(e);
	}, [c, r]);
	return /* @__PURE__ */ u(L.Provider, {
		value: { open: l },
		children: /* @__PURE__ */ u(_.Root, {
			open: l,
			onOpenChange: d,
			...a,
			children: i
		})
	});
}
function z(e) {
	return /* @__PURE__ */ u(_.Trigger, {
		"data-slot": "sheet-trigger",
		...e
	});
}
function B(e) {
	return /* @__PURE__ */ u(_.Close, {
		"data-slot": "sheet-close",
		...e
	});
}
function V(e) {
	return /* @__PURE__ */ u(_.Portal, {
		"data-slot": "sheet-portal",
		...e
	});
}
function H({ className: e, ...t }) {
	return /* @__PURE__ */ u(_.Overlay, {
		"data-slot": "sheet-overlay",
		className: b("fixed inset-0 z-50 bg-black/70 backdrop-blur-sm", e),
		...t
	});
}
function U({ className: e, ...t }) {
	return /* @__PURE__ */ u(_.Title, {
		"data-slot": "sheet-title",
		className: b("text-base font-semibold text-foreground", e),
		...t
	});
}
function fe({ className: e, ...t }) {
	return /* @__PURE__ */ u(_.Description, {
		"data-slot": "sheet-description",
		className: b("text-sm text-muted-foreground", e),
		...t
	});
}
var pe = {
	top: "inset-x-0 top-0 border-b",
	bottom: "inset-x-0 bottom-0 border-t",
	left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
	right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l"
}, W = {
	top: {
		initial: { y: "-100%" },
		animate: { y: 0 },
		exit: { y: "-100%" }
	},
	bottom: {
		initial: { y: "100%" },
		animate: { y: 0 },
		exit: { y: "100%" }
	},
	left: {
		initial: { x: "-100%" },
		animate: { x: 0 },
		exit: { x: "-100%" }
	},
	right: {
		initial: { x: "100%" },
		animate: { x: 0 },
		exit: { x: "100%" }
	}
};
function G({ side: e = "right", className: t, children: r, ...i }) {
	let { open: a } = n.useContext(L);
	return /* @__PURE__ */ u(_.Portal, {
		forceMount: !0,
		children: /* @__PURE__ */ u(ee, { children: a ? /* @__PURE__ */ d(n.Fragment, { children: [/* @__PURE__ */ u(_.Overlay, {
			asChild: !0,
			forceMount: !0,
			children: /* @__PURE__ */ u(v.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				transition: { duration: .2 },
				className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
			})
		}), /* @__PURE__ */ u(_.Content, {
			asChild: !0,
			forceMount: !0,
			...i,
			children: /* @__PURE__ */ d(v.div, {
				initial: W[e].initial,
				animate: W[e].animate,
				exit: W[e].exit,
				transition: {
					type: "tween",
					duration: .2,
					ease: "easeOut"
				},
				className: b("fixed z-50 flex flex-col gap-4 border-border bg-popover p-6 text-popover-foreground shadow-xl", pe[e], t),
				children: [r, /* @__PURE__ */ d(_.Close, {
					className: "absolute right-4 top-4 rounded-md text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					children: [/* @__PURE__ */ u(c, { className: "size-4" }), /* @__PURE__ */ u("span", {
						className: "sr-only",
						children: "Fechar"
					})]
				})]
			})
		})] }, "sheet") : null })
	});
}
//#endregion
//#region src/components/ui/skeleton.tsx
function me({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "skeleton",
		className: b("animate-pulse rounded-md bg-surface-strong", e),
		...t
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function he({ className: e, ...t }) {
	return /* @__PURE__ */ u("textarea", {
		"data-slot": "textarea",
		className: b("flex min-h-20 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/tooltip.tsx
function ge({ delayDuration: e = 200, ...t }) {
	return /* @__PURE__ */ u(y.Provider, {
		"data-slot": "tooltip-provider",
		delayDuration: e,
		...t
	});
}
function _e(e) {
	return /* @__PURE__ */ u(y.Root, {
		"data-slot": "tooltip",
		...e
	});
}
function ve(e) {
	return /* @__PURE__ */ u(y.Trigger, {
		"data-slot": "tooltip-trigger",
		...e
	});
}
function ye({ className: e, sideOffset: t = 6, ...n }) {
	return /* @__PURE__ */ u(y.Portal, { children: /* @__PURE__ */ u(y.Content, {
		"data-slot": "tooltip-content",
		sideOffset: t,
		className: b("z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md", e),
		...n
	}) });
}
//#endregion
//#region src/components/auth-button.tsx
function be({ children: e, mode: t = "modal" }) {
	let n = re();
	return /* @__PURE__ */ d(D, {
		type: "button",
		onClick: () => {
			if (t === "redirect") {
				n.redirectToSignIn();
				return;
			}
			n.openSignIn();
		},
		children: [/* @__PURE__ */ u(a, {}), e]
	});
}
function K({ children: e = "Entrar", fallback: t, mode: n = "modal" }) {
	return w() ? /* @__PURE__ */ u(be, {
		mode: n,
		children: e
	}) : t === void 0 ? /* @__PURE__ */ d(D, {
		variant: "default",
		type: "button",
		disabled: !0,
		title: "Configure VITE_CLERK_PUBLISHABLE_KEY para habilitar o login.",
		children: [/* @__PURE__ */ u(a, {}), e]
	}) : /* @__PURE__ */ u(l, { children: t });
}
//#endregion
//#region src/components/auth-provider.tsx
function q({ publishableKey: e, children: t }) {
	let n = S(e);
	return n ? /* @__PURE__ */ u(C.Provider, {
		value: !0,
		children: /* @__PURE__ */ u(te, {
			publishableKey: n,
			children: t
		})
	}) : /* @__PURE__ */ u(C.Provider, {
		value: !1,
		children: t
	});
}
//#endregion
//#region src/components/user-button.tsx
function J({ fallback: e, signInLabel: t = "Entrar" }) {
	return w() ? /* @__PURE__ */ u(ne, {}) : e === void 0 ? /* @__PURE__ */ d(D, {
		variant: "outline",
		size: "sm",
		type: "button",
		"aria-label": t,
		children: [/* @__PURE__ */ u(s, {}), /* @__PURE__ */ u("span", { children: t })]
	}) : /* @__PURE__ */ u(l, { children: e });
}
//#endregion
//#region src/components/header.tsx
var Y = [
	{
		label: "Remover fundo",
		href: "https://bg-removal.agenteresolve.com.br",
		external: !0
	},
	{
		label: "Melhorar imagem",
		href: "https://imageup.agenteresolve.com.br",
		external: !0
	},
	{
		label: "QR Code",
		href: "https://qrcode.agenteresolve.com.br",
		external: !0
	},
	{
		label: "Imposição",
		href: "https://imposition.agenteresolve.com.br",
		external: !0
	}
];
function xe() {
	return /* @__PURE__ */ d("a", {
		href: "https://agenteresolve.com.br",
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ u("span", {
			"aria-hidden": !0,
			className: "size-7 rounded-lg bg-brand-gradient"
		}), /* @__PURE__ */ u("span", {
			className: "text-sm font-semibold tracking-tight text-foreground",
			children: "Agenteresolve"
		})]
	});
}
function X({ item: e, className: t }) {
	let n = e.icon;
	return /* @__PURE__ */ d("a", {
		href: e.href,
		target: e.external ? "_blank" : void 0,
		rel: e.external ? "noreferrer" : void 0,
		className: b("inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground", t),
		children: [n ? /* @__PURE__ */ u(n, { className: "size-4" }) : null, e.label]
	});
}
function Z({ logo: e, services: t = Y, localeSwitcher: n, authSlot: r, sticky: i = !0, className: a, ...s }) {
	return /* @__PURE__ */ u("header", {
		"data-slot": "header",
		className: b("z-40 w-full border-b border-border bg-background/70 backdrop-blur-lg", i && "sticky top-0", a),
		...s,
		children: /* @__PURE__ */ d("div", {
			className: "mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4",
			children: [
				/* @__PURE__ */ d(R, { children: [/* @__PURE__ */ u(z, {
					asChild: !0,
					children: /* @__PURE__ */ u(D, {
						variant: "ghost",
						size: "icon",
						className: "md:hidden",
						"aria-label": "Abrir menu",
						children: /* @__PURE__ */ u(o, {})
					})
				}), /* @__PURE__ */ d(G, {
					side: "left",
					children: [/* @__PURE__ */ u(U, { children: "Menu" }), /* @__PURE__ */ u("nav", {
						"aria-label": "Serviços",
						className: "flex flex-col gap-1",
						children: t.map((e) => /* @__PURE__ */ u(X, { item: e }, e.href))
					})]
				})] }),
				e ?? /* @__PURE__ */ u(xe, {}),
				/* @__PURE__ */ u("nav", {
					"aria-label": "Serviços",
					className: "hidden flex-1 items-center gap-1 md:flex",
					children: t.map((e) => /* @__PURE__ */ u(X, { item: e }, e.href))
				}),
				/* @__PURE__ */ d("div", {
					className: "ml-auto flex items-center gap-2",
					children: [n, r ?? /* @__PURE__ */ u(J, {})]
				})
			]
		})
	});
}
//#endregion
//#region src/components/footer.tsx
var Q = [{
	title: "Serviços",
	links: Y.map(({ label: e, href: t, external: n }) => ({
		label: e,
		href: t,
		external: n
	}))
}, {
	title: "Institucional",
	links: [
		{
			label: "Sobre",
			href: "https://agenteresolve.com.br/sobre",
			external: !0
		},
		{
			label: "Blog",
			href: "https://agenteresolve.com.br/blog",
			external: !0
		},
		{
			label: "Contato",
			href: "https://agenteresolve.com.br/contato",
			external: !0
		}
	]
}];
function Se() {
	return /* @__PURE__ */ d("a", {
		href: "https://agenteresolve.com.br",
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ u("span", {
			"aria-hidden": !0,
			className: "size-7 rounded-lg bg-brand-gradient"
		}), /* @__PURE__ */ u("span", {
			className: "text-sm font-semibold tracking-tight text-foreground",
			children: "Agenteresolve"
		})]
	});
}
function $({ logo: e, description: t = "Ferramentas de IA para imagens, impressão e produtividade.", columns: n = Q, legal: r, className: i, ...a }) {
	let o = (/* @__PURE__ */ new Date()).getFullYear();
	return /* @__PURE__ */ d("footer", {
		"data-slot": "footer",
		className: b("w-full border-t border-border bg-background/60", i),
		...a,
		children: [/* @__PURE__ */ d("div", {
			className: "mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4",
			children: [/* @__PURE__ */ d("div", {
				className: "flex flex-col gap-3 sm:col-span-2",
				children: [e ?? /* @__PURE__ */ u(Se, {}), /* @__PURE__ */ u("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: t
				})]
			}), n.map((e) => /* @__PURE__ */ d("nav", {
				"aria-label": e.title,
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ u("h2", {
					className: "text-sm font-semibold text-foreground",
					children: e.title
				}), /* @__PURE__ */ u("ul", {
					className: "flex flex-col gap-2",
					children: e.links.map((t) => /* @__PURE__ */ u("li", { children: /* @__PURE__ */ u("a", {
						href: t.href,
						target: t.external ? "_blank" : void 0,
						rel: t.external ? "noreferrer" : void 0,
						className: "text-sm text-muted-foreground transition-colors hover:text-foreground",
						children: t.label
					}) }, `${e.title}-${t.href}-${t.label}`))
				})]
			}, e.title))]
		}), /* @__PURE__ */ u("div", {
			className: "border-t border-border",
			children: /* @__PURE__ */ u("div", {
				className: "mx-auto w-full max-w-6xl px-4 py-6",
				children: /* @__PURE__ */ u("p", {
					className: "text-xs text-muted-foreground",
					children: r ?? `© ${o} Agenteresolve. Todos os direitos reservados.`
				})
			})
		})]
	});
}
//#endregion
//#region src/components/service-shell.tsx
function Ce({ children: e, publishableKey: t, logo: n, services: r, localeSwitcher: i, authSlot: a, title: o, description: s, className: c, contentClassName: l, headerProps: f, footerProps: p }) {
	let m = !!(o || s);
	return /* @__PURE__ */ u(q, {
		publishableKey: t,
		children: /* @__PURE__ */ d("div", {
			"data-slot": "service-shell",
			className: b("flex min-h-screen flex-col bg-background text-foreground", c),
			children: [
				/* @__PURE__ */ u(Z, {
					logo: n,
					services: r,
					localeSwitcher: i,
					authSlot: a,
					...f
				}),
				/* @__PURE__ */ u("main", {
					"data-slot": "service-main",
					className: b("flex-1", l),
					children: /* @__PURE__ */ d("div", {
						className: "mx-auto w-full max-w-6xl px-4 py-10",
						children: [m ? /* @__PURE__ */ d("div", {
							className: "mb-8 flex flex-col gap-2",
							children: [o ? /* @__PURE__ */ u("h1", {
								className: "text-3xl font-semibold tracking-tight text-foreground sm:text-4xl",
								children: o
							}) : null, s ? /* @__PURE__ */ u("p", {
								className: "max-w-2xl text-base text-muted-foreground",
								children: s
							}) : null]
						}) : null, e]
					})
				}),
				/* @__PURE__ */ u($, {
					logo: n,
					...p
				})
			]
		})
	});
}
//#endregion
export { ie as Accordion, se as AccordionContent, ae as AccordionItem, oe as AccordionTrigger, K as AuthButton, q as AuthProvider, ce as Avatar, ue as AvatarFallback, le as AvatarImage, de as Badge, D as Button, O as Card, M as CardContent, j as CardDescription, N as CardFooter, k as CardHeader, A as CardTitle, C as ClerkAvailableContext, $ as Footer, Z as Header, P as Input, F as Label, I as Separator, Ce as ServiceShell, R as Sheet, B as SheetClose, G as SheetContent, fe as SheetDescription, H as SheetOverlay, V as SheetPortal, U as SheetTitle, z as SheetTrigger, me as Skeleton, he as Textarea, _e as Tooltip, ye as TooltipContent, ge as TooltipProvider, ve as TooltipTrigger, J as UserButton, T as badgeVariants, E as buttonVariants, b as cn, Q as defaultFooterColumns, Y as defaultServiceNav, S as resolveClerkPublishableKey, w as useClerkAvailable };
