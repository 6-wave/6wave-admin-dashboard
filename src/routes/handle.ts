/** What a route can say about itself. `crumb` feeds the breadcrumb in the header. */
export interface RouteHandle {
  crumb?: string | ((data: unknown) => string)
}
