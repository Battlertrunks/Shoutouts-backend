interface OrExpression {
  to?: string;
  from?: string;
}

export default interface OrQuery {
  $or: OrExpression[];
}
