import { DeliveryFeeResponseDto } from './delivery-fee.response.dto';

describe('DeliveryFeeResponseDto', () => {
  it('wraps the fee coming from the domain', () => {
    expect(DeliveryFeeResponseDto.fromDomain(15000)).toEqual({ fee: 15000 });
  });

  it('keeps a zero fee instead of hiding it', () => {
    expect(DeliveryFeeResponseDto.fromDomain(0)).toEqual({ fee: 0 });
  });
});
