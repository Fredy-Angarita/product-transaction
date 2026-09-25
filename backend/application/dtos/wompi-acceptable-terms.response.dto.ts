import { ApiProperty } from '@nestjs/swagger';

import type {
  WompiAcceptableTerms,
  WompiAgreement,
} from '../../domain/models/wompi-acceptable-terms.model';

export class WompiAgreementResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9' })
  acceptanceToken!: string;

  @ApiProperty({ example: 'https://checkout.wompi.co/l/abc123' })
  permalink!: string;

  @ApiProperty({ example: 'signed_acceptance' })
  type!: string;

  constructor(agreement: WompiAgreement) {
    this.acceptanceToken = agreement.acceptanceToken;
    this.permalink = agreement.permalink;
    this.type = agreement.type;
  }

  static fromDomain(agreement: WompiAgreement): WompiAgreementResponseDto {
    return new WompiAgreementResponseDto(agreement);
  }
}

export class WompiAcceptableTermsResponseDto {
  @ApiProperty({ type: WompiAgreementResponseDto })
  presignedAcceptance!: WompiAgreementResponseDto;

  @ApiProperty({ type: WompiAgreementResponseDto })
  presignedPersonalDataAuth!: WompiAgreementResponseDto;

  constructor(terms: WompiAcceptableTerms) {
    this.presignedAcceptance = WompiAgreementResponseDto.fromDomain(
      terms.presignedAcceptance,
    );
    this.presignedPersonalDataAuth = WompiAgreementResponseDto.fromDomain(
      terms.presignedPersonalDataAuth,
    );
  }

  static fromDomain(
    terms: WompiAcceptableTerms,
  ): WompiAcceptableTermsResponseDto {
    return new WompiAcceptableTermsResponseDto(terms);
  }
}
