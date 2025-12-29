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

    # Helper to unwrap different shapes (scalar, {"price": x}, {"base_price": x})
    def _extract_price(entry: object) -> float:
        if isinstance(entry, (int, float)):
            return float(entry)
        if isinstance(entry, dict):
            if "price" in entry:
                return float(entry["price"])
            if "base_price" in entry:
                return float(entry["base_price"])
        raise ValueError(f"Price not defined for material '{material_key}'")

    if variant:
        if not isinstance(material, dict):
            raise ValueError(f"Material '{material_key}' does not support variants")

        if variant not in material:
            raise ValueError(
                f"Variant '{variant}' not found for material '{material_key}'"
            )

        return _extract_price(material[variant])

    # No variant provided; material may be scalar or have direct price/base_price
    if isinstance(material, dict) and not {"price", "base_price"} & material.keys():
        # Dictionary of variants without explicit price/base_price; take first entry
        for entry in material.values():
            return _extract_price(entry)

    return _extract_price(material)
