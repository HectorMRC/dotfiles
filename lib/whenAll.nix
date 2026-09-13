# Returns `value` when `set` contains every item in `wanted`, otherwise the empty value is returned.
set: wanted: value:
if builtins.all (item: builtins.elem item set) wanted then
  value
else if builtins.isList value then
  [ ]
else
  { }
