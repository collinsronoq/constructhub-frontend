def resolve_material_price(
    material_key: str,
    variant: str | None,
    base_prices: dict,
    vendor_price: float | None = None,
) -> float:
    """
    Resolve material price using vendor override if available.
    """

    if vendor_price is not None:
        return vendor_price

    material = base_prices.get(material_key)

    if not material:
        raise ValueError(f"Material '{material_key}' not found in base prices")

    if variant:
        return material[variant]["price"]

    return material["price"]
