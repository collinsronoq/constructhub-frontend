# from dataclasses import dataclass
# from typing import Literal


# StructureType = Literal[
#     "bungalow",
#     "two_storey",
#     "three_storey",
#     "multi_storey"
# ]


# @dataclass
# class LandFeasibilityResult:
#     land_size_sqm: float
#     structure_type: StructureType

#     floors: int
#     max_site_coverage_ratio: float
#     buildable_footprint_sqm: float

#     total_allowable_floor_area_sqm: float
#     effective_floor_area_per_floor_sqm: float


# def resolve_floors(structure_type: StructureType) -> int:
#     return {
#         "bungalow": 1,
#         "two_storey": 2,
#         "three_storey": 3,
#         "multi_storey": 4
#     }.get(structure_type, 1)


# def resolve_land_feasibility(
#     land_size_sqm: float,
#     structure_type: StructureType,
# ) -> LandFeasibilityResult:
#     """
#     Resolves land constraints into buildable footprint and floor area limits.
#     """

#     # Conservative defaults
#     max_site_coverage_ratio = 0.6
#     circulation_loss_ratio = 0.15

#     floors = resolve_floors(structure_type)

#     # Raw footprint allowed
#     raw_footprint = land_size_sqm * max_site_coverage_ratio

#     # After setbacks & inefficiencies
#     buildable_footprint = raw_footprint * (1 - circulation_loss_ratio)

#     total_allowable_floor_area = buildable_footprint * floors

#     effective_per_floor = total_allowable_floor_area / floors

#     print(f'''
#           here are the details to regarding land: \n 
#           land size: {land_size_sqm} \n 
#           floors: {floors} \n 
#           max site coverage: {max_site_coverage_ratio} \n 
#           buildable footprint: {buildable_footprint} \n
#           allowable floor area: {total_allowable_floor_area} \n
#           effective floor area: {effective_per_floor} \n

#     ''')

#     return LandFeasibilityResult(
#         land_size_sqm=land_size_sqm,
#         structure_type=structure_type,
#         floors=floors,
#         max_site_coverage_ratio=max_site_coverage_ratio,
#         buildable_footprint_sqm=round(buildable_footprint, 2),
#         total_allowable_floor_area_sqm=round(total_allowable_floor_area, 2),
#         effective_floor_area_per_floor_sqm=round(effective_per_floor, 2),
#     )
