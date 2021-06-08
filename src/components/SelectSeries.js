import { Select } from "antd";

const SelectSeries = ({ options, defaultValue, onChange, className }) => {
  return (
    <Select
      className={className}
      placeholder="Choose series"
      onChange={onChange}
      defaultValue={defaultValue}
      options={options}
    />
  );
};
export default SelectSeries;
